import dayjs from "dayjs";
import { supabase, WOUND_BUCKET } from "./supabaseClient";
import { todayStr } from "./format";

/* ------------------------ Adherence Insights --------------------------- */
// Returns last-7-days adherence series for a patient (from medicine_dose_logs).
export async function getWeeklyAdherence(patientId) {
  const start = dayjs().subtract(6, "day").format("YYYY-MM-DD");
  const { data, error } = await supabase
    .from("medicine_dose_logs")
    .select("log_date, is_taken")
    .eq("patient_id", patientId)
    .gte("log_date", start);
  if (error) throw error;

  const map = {};
  for (let i = 0; i < 7; i++) {
    const d = dayjs()
      .subtract(6 - i, "day")
      .format("YYYY-MM-DD");
    map[d] = { date: d, taken: 0, total: 0, label: dayjs(d).format("ddd") };
  }
  (data || []).forEach((r) => {
    if (map[r.log_date]) {
      map[r.log_date].total += 1;
      if (r.is_taken) map[r.log_date].taken += 1;
    }
  });
  const series = Object.values(map).map((x) => ({
    ...x,
    pct: x.total ? Math.round((x.taken / x.total) * 100) : 0,
  }));
  const totals = series.reduce(
    (acc, s) => ({ taken: acc.taken + s.taken, total: acc.total + s.total }),
    { taken: 0, total: 0 }
  );
  const weeklyPct = totals.total ? Math.round((totals.taken / totals.total) * 100) : 0;
  return { series, ...totals, weeklyPct };
}

/* ------------------------- Specialties & Doctor ------------------------- */
export async function getSpecialties() {
  const { data, error } = await supabase.from("specialties").select("*");
  if (error) throw error;
  return data || [];
}

// Returns { profile, doctor, specialty } for the primary attending doctor,
// optionally scoped to a specialty id.
export async function getDoctorFull(specialtyId) {
  let dq = supabase.from("doctor_profiles").select("*");
  if (specialtyId) dq = dq.eq("specialty_id", specialtyId);
  const { data: docs, error } = await dq.limit(1);
  if (error) throw error;
  const doctor = docs?.[0];
  if (!doctor) return null;
  const [{ data: prof }, { data: sp }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", doctor.id).maybeSingle(),
    supabase.from("specialties").select("*").eq("id", doctor.specialty_id).maybeSingle(),
  ]);
  return { profile: prof, doctor, specialty: sp };
}

export async function getDoctorById(doctorId) {
  const [{ data: prof }, { data: doctor }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", doctorId).maybeSingle(),
    supabase.from("doctor_profiles").select("*").eq("id", doctorId).maybeSingle(),
  ]);
  let specialty = null;
  if (doctor?.specialty_id) {
    const { data: sp } = await supabase
      .from("specialties")
      .select("*")
      .eq("id", doctor.specialty_id)
      .maybeSingle();
    specialty = sp;
  }
  return { profile: prof, doctor, specialty };
}

/* ------------------------------- Auth ---------------------------------- */
// Fetch the profile row for the currently-authenticated Supabase user (by email).
export async function getMyProfile() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) return null;
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("email", user.email)
    .maybeSingle();
  return data;
}

// Ensure a patient profile exists for the authenticated session (used on OTP login).
export async function ensurePatientProfile({ full_name, phone_number } = {}) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) throw new Error("No authenticated session.");
  const existing = await getMyProfile();
  if (existing) return existing;
  const name = full_name || user.email.split("@")[0];
  const prof = await registerPatient({
    full_name: name,
    phone_number: phone_number || "",
    email: user.email,
  });
  return prof;
}

// Create doctor profile + doctor_profiles row for the authenticated session.
export async function createDoctorProfileForSession(payload) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) throw new Error("No authenticated session.");
  return registerDoctor({ ...payload, email: user.email });
}

export async function findPatientByIdentifier(identifier) {
  const id = (identifier || "").trim();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "patient")
    .or(`email.eq.${id},phone_number.eq.${id}`)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function findDoctorByEmail(email) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "doctor")
    .eq("email", (email || "").trim())
    .maybeSingle();
  if (error) throw error;
  return data;
}

function genMRN() {
  const y = new Date().getFullYear();
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `MRN-${y}-${rand}`;
}

export async function registerPatient({ full_name, phone_number, email, date_of_birth }) {
  const { data: prof, error } = await supabase
    .from("profiles")
    .insert({ role: "patient", full_name, phone_number, email })
    .select()
    .single();
  if (error) throw error;
  const mrn = genMRN();
  const { error: ppErr } = await supabase
    .from("patient_profiles")
    .insert({ id: prof.id, mrn, date_of_birth: date_of_birth || null });
  if (ppErr) throw ppErr;
  return { ...prof, mrn };
}

export async function registerDoctor({
  full_name,
  email,
  specialty_id,
  custom_specialty_name,
  years_of_experience,
  clinic_phone_number,
  consultation_fee,
  advance_booking_fee,
}) {
  const { data: prof, error } = await supabase
    .from("profiles")
    .insert({ role: "doctor", full_name, email, phone_number: clinic_phone_number })
    .select()
    .single();
  if (error) throw error;
  const { error: dErr } = await supabase.from("doctor_profiles").insert({
    id: prof.id,
    specialty_id: specialty_id || null,
    custom_specialty_name,
    years_of_experience: Number(years_of_experience) || 0,
    clinic_phone_number,
    emergency_contact: clinic_phone_number,
    consultation_fee: Number(consultation_fee) || 0,
    advance_booking_fee: Number(advance_booking_fee) || 0,
  });
  if (dErr) throw dErr;
  return prof;
}

export async function getPatientProfile(id) {
  const { data } = await supabase.from("patient_profiles").select("*").eq("id", id).maybeSingle();
  return data;
}

/* --------------------------- Appointments ------------------------------ */
export async function createAppointment({
  patient_id,
  doctor_id,
  appointment_datetime,
  problem_description,
  detected_specialty,
  advance_fee_paid,
}) {
  const { data, error } = await supabase
    .from("appointments")
    .insert({
      patient_id,
      doctor_id,
      appointment_datetime,
      problem_description,
      detected_specialty,
      advance_fee_paid,
      payment_status: "paid",
      status: "scheduled",
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

// Appointments for a doctor, with joined patient profile data.
export async function getDoctorAppointments(doctorId) {
  const { data: appts, error } = await supabase
    .from("appointments")
    .select("*")
    .eq("doctor_id", doctorId)
    .order("appointment_datetime", { ascending: true });
  if (error) throw error;
  const patientIds = [...new Set((appts || []).map((a) => a.patient_id))];
  let patients = {};
  if (patientIds.length) {
    const { data: profs } = await supabase.from("profiles").select("*").in("id", patientIds);
    (profs || []).forEach((p) => (patients[p.id] = p));
  }
  return (appts || []).map((a) => ({ ...a, patient: patients[a.patient_id] || null }));
}

/* ------------------------------- EHR ----------------------------------- */
export async function getLatestEhrForPatient(patientId) {
  const { data, error } = await supabase
    .from("ehr_records")
    .select("*")
    .eq("patient_id", patientId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function rescheduleFollowUp(ehrId, newDatetimeIso) {
  const { data, error } = await supabase
    .from("ehr_records")
    .update({ next_follow_up_datetime: newDatetimeIso, follow_up_rescheduled: true })
    .eq("id", ehrId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// Doctor completes a consultation: creates EHR, generates dose logs, marks appt completed.
export async function completeConsultation({
  appointment,
  diagnosis,
  clinical_notes,
  prescriptions, // [{ name, quantity, timing, schedule: ["08:00 AM", ...] }]
  next_follow_up_datetime,
}) {
  const { data: ehr, error } = await supabase
    .from("ehr_records")
    .insert({
      appointment_id: appointment.id,
      patient_id: appointment.patient_id,
      doctor_id: appointment.doctor_id,
      diagnosis,
      clinical_notes,
      prescriptions,
      next_follow_up_datetime: next_follow_up_datetime || null,
      follow_up_rescheduled: false,
      dispatched_to_email: true,
      dispatched_to_mobile: true,
    })
    .select()
    .single();
  if (error) throw error;

  // Generate today's dose logs from prescription schedules
  const logs = [];
  const today = todayStr();
  (prescriptions || []).forEach((p) => {
    (p.schedule || []).forEach((t) => {
      logs.push({
        patient_id: appointment.patient_id,
        ehr_record_id: ehr.id,
        medicine_name: p.name,
        dosage_quantity: p.quantity || "1 dose",
        scheduled_time: t,
        is_taken: false,
        log_date: today,
      });
    });
  });
  if (logs.length) {
    const { error: logErr } = await supabase.from("medicine_dose_logs").insert(logs);
    if (logErr) throw logErr;
  }

  await supabase.from("appointments").update({ status: "completed" }).eq("id", appointment.id);
  return ehr;
}

/* ------------------------- Medicine Dose Logs -------------------------- */
export async function getDoseLogs(patientId, dateStr = todayStr()) {
  const { data, error } = await supabase
    .from("medicine_dose_logs")
    .select("*")
    .eq("patient_id", patientId)
    .eq("log_date", dateStr)
    .order("scheduled_time", { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function setDoseTaken(id, isTaken) {
  const { data, error } = await supabase
    .from("medicine_dose_logs")
    .update({ is_taken: isTaken, taken_at: isTaken ? new Date().toISOString() : null })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

/* --------------------------- Interim Updates --------------------------- */
export async function submitInterimUpdate(payload) {
  const { data, error } = await supabase
    .from("interim_daily_updates")
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getTriageFeed(doctorId) {
  const { data: rows, error } = await supabase
    .from("interim_daily_updates")
    .select("*")
    .eq("doctor_id", doctorId)
    .order("submitted_at", { ascending: false });
  if (error) throw error;
  const patientIds = [...new Set((rows || []).map((r) => r.patient_id))];
  let patients = {};
  if (patientIds.length) {
    const { data: profs } = await supabase.from("profiles").select("*").in("id", patientIds);
    (profs || []).forEach((p) => (patients[p.id] = p));
  }
  return (rows || []).map((r) => ({ ...r, patient: patients[r.patient_id] || null }));
}

export async function reviewTriage(id, quickAction) {
  const { data, error } = await supabase
    .from("interim_daily_updates")
    .update({ is_reviewed: true, doctor_quick_action: quickAction || "Reviewed" })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

/* --------------------------- Photo Upload ------------------------------ */
export async function uploadWoundPhoto(file) {
  const ext = file.name.split(".").pop() || "jpg";
  const path = `checkins/${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage.from(WOUND_BUCKET).upload(path, file, {
    contentType: file.type || "image/jpeg",
    upsert: false,
  });
  if (error) throw error;
  const { data } = supabase.storage.from(WOUND_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

/* ----------------------------- Inventory ------------------------------- */
export async function getInventory() {
  const { data, error } = await supabase
    .from("medicine_inventory")
    .select("*")
    .order("expiry_date", { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function addInventory(row) {
  const { data, error } = await supabase.from("medicine_inventory").insert(row).select().single();
  if (error) throw error;
  return data;
}

export async function updateInventory(id, patch) {
  const { data, error } = await supabase
    .from("medicine_inventory")
    .update(patch)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

/* -------------------------- Operation Schedules ------------------------ */
export async function getOperationSchedules(doctorId) {
  let q = supabase.from("operation_schedules").select("*").order("operation_date", {
    ascending: true,
  });
  if (doctorId) q = q.eq("lead_surgeon_id", doctorId);
  const { data: rows, error } = await q;
  if (error) throw error;
  const patientIds = [...new Set((rows || []).map((r) => r.patient_id))];
  let patients = {};
  if (patientIds.length) {
    const { data: profs } = await supabase.from("profiles").select("*").in("id", patientIds);
    (profs || []).forEach((p) => (patients[p.id] = p));
  }
  return (rows || []).map((r) => ({ ...r, patient: patients[r.patient_id] || null }));
}
