import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, IdCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MedivaLogo, StatusPill } from "@/components/Brand";
import { useAuth } from "@/context/AuthContext";
import {
  getLatestEhrForPatient,
  getDoctorById,
  getDoctorFull,
  getDoseLogs,
  getPatientProfile,
} from "@/lib/api";
import AttendingDoctorHeader from "@/components/patient/AttendingDoctorHeader";
import MedicineReminders from "@/components/patient/MedicineReminders";
import EhrCard from "@/components/patient/EhrCard";
import InterimCheckIn from "@/components/patient/InterimCheckIn";

export default function PatientDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [ehr, setEhr] = useState(null);
  const [doctor, setDoctor] = useState(null);
  const [doseLogs, setDoseLogs] = useState([]);
  const [patientProfile, setPatientProfile] = useState(null);

  const load = useCallback(async () => {
    if (!user) return;
    try {
      const [ehrRow, pProfile] = await Promise.all([
        getLatestEhrForPatient(user.id),
        getPatientProfile(user.id),
      ]);
      setEhr(ehrRow);
      setPatientProfile(pProfile);

      const doc = ehrRow?.doctor_id
        ? await getDoctorById(ehrRow.doctor_id)
        : await getDoctorFull();
      setDoctor(doc);

      const logs = await getDoseLogs(user.id);
      setDoseLogs(logs);
    } catch (e) {
      // keep UI resilient
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const refreshDoses = useCallback(async () => {
    if (!user) return;
    const logs = await getDoseLogs(user.id);
    setDoseLogs(logs);
  }, [user]);

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  const doctorPhone = doctor?.doctor?.clinic_phone_number;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-md items-center justify-between px-4 py-3">
          <MedivaLogo showText={false} />
          <div className="flex items-center gap-2">
            {patientProfile?.mrn && (
              <StatusPill tone="slate">
                <IdCard className="h-3.5 w-3.5" /> {patientProfile.mrn}
              </StatusPill>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="text-slate-500"
              data-testid="patient-logout-button"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-md px-4 pb-24 pt-4">
        <div className="mb-4">
          <h1 className="text-xl font-semibold tracking-tight text-slate-900">
            Hello, {user?.full_name?.split(" ")[0] || "there"} 👋
          </h1>
          <p className="text-sm text-slate-500">Here's your recovery plan for today.</p>
        </div>

        {loading ? (
          <div className="space-y-3" data-testid="loading-skeleton">
            <Skeleton className="h-20 w-full rounded-xl bg-slate-100" />
            <Skeleton className="h-28 w-full rounded-xl bg-slate-100" />
            <Skeleton className="h-40 w-full rounded-xl bg-slate-100" />
          </div>
        ) : (
          <div className="space-y-5">
            <AttendingDoctorHeader doctor={doctor} />

            <section>
              <h2 className="mb-2 text-sm font-semibold text-slate-900">💊 Medicine Reminders</h2>
              <MedicineReminders doseLogs={doseLogs} onChange={refreshDoses} />
            </section>

            <section>
              <h2 className="mb-2 text-sm font-semibold text-slate-900">📋 Your Health Record</h2>
              <EhrCard ehr={ehr} onChange={load} />
            </section>

            <section>
              <h2 className="mb-2 text-sm font-semibold text-slate-900">🩺 Daily Check-In</h2>
              <InterimCheckIn
                ehr={ehr}
                patientId={user?.id}
                doctorId={doctor?.doctor?.id || ehr?.doctor_id}
                doctorPhone={doctorPhone}
                onSubmitted={() => {}}
              />
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
