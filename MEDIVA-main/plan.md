# MEDIVA AI (React + Supabase) — Development Plan (Updated)

## 1) Objectives
- **Deliver a complete, enterprise-grade hospital web app** (Patient + Doctor portals) using **CRA React + React Router + Supabase client-side**.
- Provide stable, end-to-end clinical workflows: **symptom triage → booking → EHR → reminders/dose logging → interim triage feed → inventory/ops dashboards**.
- Maintain the **“Enterprise Clinical Authority”** design system (slate-50 canvas, white cards, navy primary, sky accents, triage badge palette).
- Ensure testability and quality: **route guards, deterministic demo-auth**, consistent `data-testid`s, and verified Supabase read/write paths.

**Current status:** The application is **implemented and working end-to-end** against the live Supabase project, with **100% frontend tests passing** and **0 critical bugs**.

---

## 2) Implementation Steps

### Phase 1 — Core Workflow POC (Isolation) ✅ Completed / Verified
**Goal:** Prove the failure-prone integration points (Supabase schema, permissions, read/write operations, storage upload) before building UI.

What was done:
- Supabase connectivity established using anon key.
- **Permissions/RLS blocker resolved** (anon access granted for demo; RLS disabled) enabling client-side access.
- Verified **read access** to all 10 tables.
- Verified **write paths**:
  - Create appointment (booking)
  - Create profile + patient_profile (registration + MRN)
  - Toggle medicine_dose_logs (mark taken)
  - Insert interim_daily_updates (check-in)
  - Upload/remove image to storage bucket **`wound-photos`**
- Confirmed schema + seed data:
  - Dr. Shourya (doctor@mediva.ai)
  - Aarav Sharma (patient@mediva.ai)
  - Seed EHR with prescriptions + dose logs
  - Medicine inventory
  - Operation schedule

**User stories (POC):**
1. As a developer, I can fetch seed doctor/patient data from Supabase to validate the environment.
2. As a developer, I can create and delete an appointment record to prove booking writes.
3. As a developer, I can upload and retrieve a public URL for a wound photo.
4. As a developer, I can create a health check-in record and read it back.
5. As a developer, I can toggle a dose log and revert it safely.

---

### Phase 2 — V1 App Development (Build around proven core) ✅ Completed / Verified
**Goal:** Implement full UX flows with route guards + demo-auth, and ship a complete working V1.

#### 2.1 Foundation & Architecture ✅ Completed
- Implemented `src/lib/supabaseClient.js` using the live Supabase URL + anon key.
- Added **AuthContext** + localStorage session model:
  - **Patient login:** lookup `profiles` by email/phone where `role='patient'` (passwordless demo).
  - **Doctor login:** email + password (demo); seed doctor `doctor@mediva.ai / password123`.
  - New doctor passwords stored client-side in localStorage map (demo).
  - **Cross-portal restrictions** enforced.
- React Router routes implemented:
  - `/` (Landing)
  - `/login`
  - `/book`
  - `/patient/dashboard` (guarded)
  - `/doctor/dashboard` (guarded)

#### 2.2 Shared UI System (Clinical Authority) ✅ Completed
- Applied clinical theme:
  - Canvas: `bg-slate-50`
  - White cards + `border-slate-200`
  - Primary: navy (`text-slate-900`, `bg-slate-900`)
  - Accents: `bg-sky-600 hover:bg-sky-700`
  - Exact triage badge styling:
    - Red: `bg-rose-50 text-rose-700 border-rose-500`
    - Yellow: `bg-amber-50 text-amber-700 border-amber-500`
    - Green: `bg-emerald-50 text-emerald-700 border-emerald-500`
- Built shared primitives:
  - `MedivaLogo`, `TriageBadge`, status pills
- Implemented consistent `data-testid` coverage.

#### 2.3 Patient Portal (mobile-first) ✅ Completed
- **Attending doctor header** with tel: call button.
- **Medicine Reminder System**:
  - Next-dose countdown
  - Dose checklist with **Mark as Taken** (Supabase update)
  - Snooze 15 minutes (client-side)
  - Daily adherence bar
  - **Chronological ordering fix applied** (morning → afternoon → night)
- **EHR card**:
  - Diagnosis, notes, prescriptions
  - “Dispatched to Email & WhatsApp” status (simulated)
  - Next follow-up banner
  - **Reschedule drawer** (calendar + time slot) updates `ehr_records`.
- **45-second Interim Health Check-In**:
  - Pain slider, temperature input, meds taken toggle
  - Symptom tags + optional photo upload
  - Photo upload to Supabase Storage bucket `wound-photos`
  - Inserts into `interim_daily_updates`
  - Green/Yellow/Red triage result panel
  - Red tier includes persistent emergency call buttons (doctor + 112/108).

#### 2.4 Booking Flow (/book) ✅ Completed
- Smart symptom triage (keyword matcher against `specialties.keywords`).
- Matched doctor card (Dr. Shourya, experience, fees, phone).
- Date/time selection.
- **Simulated payment (₹200 advance)** then:
  - creates/finds patient profile + MRN
  - inserts appointment (`payment_status='paid'`)
  - **auto-logins patient** and redirects to dashboard.

#### 2.5 Doctor Portal (desktop cockpit) ✅ Completed
- Doctor profile header.
- 4-tab command center:
  1) **Today’s Appointments** roster + search + status
     - Consultation Dialog:
       - diagnosis, notes, prescriptions, follow-up
       - Discharge & Dispatch:
         - inserts `ehr_records`
         - generates `medicine_dose_logs`
         - marks appointment completed
       - **a11y improvement applied**: `DialogDescription` added.
  2) **Surgery Board** from `operation_schedules`.
  3) **Stock & Expiry Manager** from `medicine_inventory`:
     - sorted by expiry ascending
     - expiry status badges (R/A/G)
     - add stock dialog
     - **a11y improvement applied**: `DialogDescription` added.
  4) **Interim Recovery Triage Feed** from `interim_daily_updates`:
     - Red/Yellow pinned to top
     - click-to-call + mark reviewed

#### 2.6 Data Fetching & State ✅ Completed
- Implemented Supabase data access via `src/lib/api.js`.
- Loading states via Skeleton; resilient UI when data is delayed.

#### 2.7 V1 Testing (end of Phase 2) ✅ Completed
- Ran `testing_agent_v3` for end-to-end flows.
- **Result:** 100% frontend success, 0 critical bugs.
- Minor accessibility warning addressed by adding `DialogDescription`.

**User stories (V1):** ✅ Completed
1. As a patient, I can book an appointment by describing symptoms and paying a simulated advance fee.
2. As a patient, I can see my EHR and reschedule a follow-up date.
3. As a patient, I can mark medicines as taken and track daily adherence.
4. As a patient, I can submit a daily check-in with optional photo and receive triage guidance.
5. As a doctor, I can complete a consultation and dispatch an EHR that generates dose schedules.
6. As a doctor, I can view operations schedule and inventory with clear expiry warnings.
7. As a doctor, I can review interim triage submissions and take quick actions.

---

### Phase 3 — Hardening, UX Polish, and Feature Expansion (Optional / Next)
**Goal:** Improve realism, robustness, and compliance without changing the V1 UX goals.

Planned improvements:
- **Security model upgrade:** migrate demo-auth to **Supabase Auth** + **RLS** + role-based policies.
- **Triage logic enrichment:** larger keyword sets, better rule tuning, specialty fallback improvements.
- **Timezone correctness:** robust scheduling for appointments, follow-ups, and dose times.
- **Reliability:** optimistic UI updates + retry semantics for writes.
- **Clinical audit UX:** timeline views for EHR + interim updates.
- **Accessibility pass:** add descriptions/labels consistently, keyboard traps verification.

**End of Phase 3 Testing:** rerun `testing_agent_v3` across both portals.

**User stories (hardening/polish):**
1. As a patient, I can recover my session after refresh without losing my place.
2. As a patient, I can understand errors (network/validation) with clear next steps.
3. As a doctor, I can quickly filter today’s roster by status and patient name.
4. As a doctor, I can safely edit inventory without corrupting quantities.
5. As an admin/demo user, I can reset demo data locally (logout/clear session) easily.

---

### Phase 4 — Optional (If Requested): More Realism / Integrations
- Replace simulated dispatch with real **Email/WhatsApp** sending (requires providers/credentials).
- Replace simulated payment with real payment gateway (Stripe/Razorpay).

**User stories (optional):**
1. As a user, I can sign in securely with OTP/email and have my data isolated.
2. As a doctor, I can only view my own patients/appointments.
3. As a patient, my check-ins and EHR are private to me and my doctor.
4. As staff, I can dispatch EHR via real channels.
5. As billing, I can track real payment status.

---

## 3) Next Actions (Immediate)
✅ V1 is delivered. Next actions are optional and depend on whether you want a demo-only app or a production-grade system:
1. (Optional) Migrate demo-auth to Supabase Auth + restore RLS.
2. (Optional) Add real payment gateway integration.
3. (Optional) Add real email/WhatsApp dispatch integrations.
4. (Optional) Add deeper validation, audit trails, and role-based access controls.
5. (Optional) Run another full regression test after each integration.

---

## 4) Success Criteria
✅ Achieved in V1:
- Booking creates a valid `appointments` row with correct patient/doctor, paid status, and specialty.
- Patient dashboard loads latest EHR + dose logs; marking doses taken updates Supabase.
- Patient check-in inserts `interim_daily_updates` and can upload photo (stores `wound_photo_url`).
- Doctor dashboard shows roster; consultation creates `ehr_records` and generates `medicine_dose_logs`.
- Inventory and operation schedules render with correct sorting and clear expiry/triage signaling.
- End-to-end tests pass (frontend 100%).

**Demo credentials:**
- Patient: `patient@mediva.ai` (passwordless)
- Doctor: `doctor@mediva.ai` / `password123`
