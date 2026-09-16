-- =============================================================
-- MEDIVA AI · Secure Login RLS Migration
-- Run this in: Supabase Dashboard -> SQL Editor -> New query -> Run
-- Re-runnable (idempotent). Enables per-user data privacy via RLS.
-- Link key: the logged-in user's verified JWT email == profiles.email
-- =============================================================

-- ---------- Helper functions (SECURITY DEFINER avoids RLS recursion) ----------
create or replace function public.my_profile_id()
returns uuid language sql stable security definer set search_path = public as $$
  select id from public.profiles where email = (auth.jwt() ->> 'email') limit 1
$$;

create or replace function public.my_role()
returns text language sql stable security definer set search_path = public as $$
  select role from public.profiles where email = (auth.jwt() ->> 'email') limit 1
$$;

grant execute on function public.my_profile_id() to anon, authenticated;
grant execute on function public.my_role() to anon, authenticated;

-- ---------- Enable RLS on all tables ----------
alter table public.profiles              enable row level security;
alter table public.specialties           enable row level security;
alter table public.doctor_profiles       enable row level security;
alter table public.patient_profiles      enable row level security;
alter table public.appointments          enable row level security;
alter table public.ehr_records           enable row level security;
alter table public.medicine_dose_logs    enable row level security;
alter table public.interim_daily_updates enable row level security;
alter table public.medicine_inventory    enable row level security;
alter table public.operation_schedules   enable row level security;

-- ============================ profiles ============================
drop policy if exists p_profiles_select on public.profiles;
create policy p_profiles_select on public.profiles for select to anon, authenticated
  using ( role = 'doctor' or id = public.my_profile_id() or public.my_role() = 'doctor' );

drop policy if exists p_profiles_insert on public.profiles;
create policy p_profiles_insert on public.profiles for insert to authenticated
  with check ( email = (auth.jwt() ->> 'email') );

drop policy if exists p_profiles_update on public.profiles;
create policy p_profiles_update on public.profiles for update to authenticated
  using ( id = public.my_profile_id() or public.my_role() = 'doctor' )
  with check ( true );

-- ============================ specialties (public read) ============================
drop policy if exists p_specialties_select on public.specialties;
create policy p_specialties_select on public.specialties for select to anon, authenticated using ( true );

-- ============================ doctor_profiles (public read) ============================
drop policy if exists p_doctor_profiles_select on public.doctor_profiles;
create policy p_doctor_profiles_select on public.doctor_profiles for select to anon, authenticated using ( true );

drop policy if exists p_doctor_profiles_write on public.doctor_profiles;
create policy p_doctor_profiles_write on public.doctor_profiles for all to authenticated
  using ( id = public.my_profile_id() )
  with check ( id = public.my_profile_id() );

-- ============================ patient_profiles ============================
drop policy if exists p_patient_profiles_select on public.patient_profiles;
create policy p_patient_profiles_select on public.patient_profiles for select to authenticated
  using ( id = public.my_profile_id() or public.my_role() = 'doctor' );

drop policy if exists p_patient_profiles_insert on public.patient_profiles;
create policy p_patient_profiles_insert on public.patient_profiles for insert to authenticated
  with check ( id = public.my_profile_id() );

drop policy if exists p_patient_profiles_update on public.patient_profiles;
create policy p_patient_profiles_update on public.patient_profiles for update to authenticated
  using ( id = public.my_profile_id() or public.my_role() = 'doctor' ) with check ( true );

-- ============================ appointments ============================
drop policy if exists p_appointments_select on public.appointments;
create policy p_appointments_select on public.appointments for select to authenticated
  using ( patient_id = public.my_profile_id() or doctor_id = public.my_profile_id() );

drop policy if exists p_appointments_insert on public.appointments;
create policy p_appointments_insert on public.appointments for insert to authenticated
  with check ( patient_id = public.my_profile_id() or public.my_role() = 'doctor' );

drop policy if exists p_appointments_update on public.appointments;
create policy p_appointments_update on public.appointments for update to authenticated
  using ( patient_id = public.my_profile_id() or doctor_id = public.my_profile_id() ) with check ( true );

-- ============================ ehr_records ============================
drop policy if exists p_ehr_select on public.ehr_records;
create policy p_ehr_select on public.ehr_records for select to authenticated
  using ( patient_id = public.my_profile_id() or doctor_id = public.my_profile_id() );

drop policy if exists p_ehr_insert on public.ehr_records;
create policy p_ehr_insert on public.ehr_records for insert to authenticated
  with check ( public.my_role() = 'doctor' );

drop policy if exists p_ehr_update on public.ehr_records;
create policy p_ehr_update on public.ehr_records for update to authenticated
  using ( patient_id = public.my_profile_id() or doctor_id = public.my_profile_id() ) with check ( true );

-- ============================ medicine_dose_logs ============================
drop policy if exists p_dose_select on public.medicine_dose_logs;
create policy p_dose_select on public.medicine_dose_logs for select to authenticated
  using ( patient_id = public.my_profile_id() or public.my_role() = 'doctor' );

drop policy if exists p_dose_insert on public.medicine_dose_logs;
create policy p_dose_insert on public.medicine_dose_logs for insert to authenticated
  with check ( public.my_role() = 'doctor' or patient_id = public.my_profile_id() );

drop policy if exists p_dose_update on public.medicine_dose_logs;
create policy p_dose_update on public.medicine_dose_logs for update to authenticated
  using ( patient_id = public.my_profile_id() or public.my_role() = 'doctor' ) with check ( true );

-- ============================ interim_daily_updates ============================
drop policy if exists p_interim_select on public.interim_daily_updates;
create policy p_interim_select on public.interim_daily_updates for select to authenticated
  using ( patient_id = public.my_profile_id() or doctor_id = public.my_profile_id() );

drop policy if exists p_interim_insert on public.interim_daily_updates;
create policy p_interim_insert on public.interim_daily_updates for insert to authenticated
  with check ( patient_id = public.my_profile_id() );

drop policy if exists p_interim_update on public.interim_daily_updates;
create policy p_interim_update on public.interim_daily_updates for update to authenticated
  using ( doctor_id = public.my_profile_id() or patient_id = public.my_profile_id() ) with check ( true );

-- ============================ medicine_inventory (doctors only) ============================
drop policy if exists p_inventory_all on public.medicine_inventory;
create policy p_inventory_all on public.medicine_inventory for all to authenticated
  using ( public.my_role() = 'doctor' ) with check ( public.my_role() = 'doctor' );

-- ============================ operation_schedules ============================
drop policy if exists p_ops_select on public.operation_schedules;
create policy p_ops_select on public.operation_schedules for select to authenticated
  using ( lead_surgeon_id = public.my_profile_id() or patient_id = public.my_profile_id() or public.my_role() = 'doctor' );

drop policy if exists p_ops_write on public.operation_schedules;
create policy p_ops_write on public.operation_schedules for all to authenticated
  using ( public.my_role() = 'doctor' ) with check ( public.my_role() = 'doctor' );

-- Done. RLS is now active with per-user privacy.
