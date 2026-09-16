import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LogOut,
  CalendarDays,
  Scissors,
  Package,
  HeartPulse,
  Phone,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { MedivaLogo } from "@/components/Brand";
import { useAuth } from "@/context/AuthContext";
import {
  getDoctorById,
  getDoctorAppointments,
  getOperationSchedules,
  getInventory,
  getTriageFeed,
} from "@/lib/api";
import AppointmentsTab from "@/components/doctor/AppointmentsTab";
import SurgeryTab from "@/components/doctor/SurgeryTab";
import InventoryTab from "@/components/doctor/InventoryTab";
import TriageFeedTab from "@/components/doctor/TriageFeedTab";
import { initials } from "@/lib/format";

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [doctor, setDoctor] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [operations, setOperations] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [feed, setFeed] = useState([]);

  const loadAll = useCallback(async () => {
    if (!user) return;
    try {
      const [doc, appts, ops, inv, tri] = await Promise.all([
        getDoctorById(user.id),
        getDoctorAppointments(user.id),
        getOperationSchedules(user.id),
        getInventory(),
        getTriageFeed(user.id),
      ]);
      setDoctor(doc);
      setAppointments(appts);
      setOperations(ops);
      setInventory(inv);
      setFeed(tri);
    } catch (e) {
      /* resilient */
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const refetch = {
    appts: useCallback(async () => setAppointments(await getDoctorAppointments(user.id)), [user]),
    inv: useCallback(async () => setInventory(await getInventory()), []),
    feed: useCallback(async () => setFeed(await getTriageFeed(user.id)), [user]),
  };

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  const dp = doctor?.doctor;
  const specialty = dp?.custom_specialty_name || doctor?.specialty?.name || "Clinician";
  const phone = dp?.clinic_phone_number || "+91 123456789";
  const pendingTriage = feed.filter((f) => !f.is_reviewed && f.triage_tier !== "green").length;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top bar */}
      <header
        className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur"
        data-testid="doctor-topbar"
      >
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-4 py-3 sm:px-6">
          <MedivaLogo />
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="text-slate-600"
            data-testid="doctor-logout-button"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6">
        {/* Doctor profile header */}
        <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          {loading ? (
            <Skeleton className="h-14 w-full bg-slate-100" />
          ) : (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-900 text-lg font-semibold text-white">
                  {initials(doctor?.profile?.full_name || "Dr")}
                </div>
                <div>
                  <h1 className="text-xl font-semibold tracking-tight text-slate-900">
                    {doctor?.profile?.full_name || "Doctor"}
                  </h1>
                  <p className="text-sm text-slate-500">
                    {specialty}
                    {dp?.years_of_experience ? ` · ${dp.years_of_experience} yrs experience` : ""}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {pendingTriage > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-md border border-rose-500 bg-rose-50 px-2 py-1 text-xs font-semibold text-rose-700">
                    <AlertTriangle className="h-3.5 w-3.5" /> {pendingTriage} triage alert
                    {pendingTriage === 1 ? "" : "s"}
                  </span>
                )}
                <a href={`tel:${phone.replace(/\s/g, "")}`}>
                  <Button variant="outline" className="h-10 border-slate-300">
                    <Phone className="h-4 w-4" /> OPD: {phone}
                  </Button>
                </a>
              </div>
            </div>
          )}
        </div>

        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-10 w-full bg-slate-100" />
            <Skeleton className="h-64 w-full rounded-xl bg-slate-100" />
          </div>
        ) : (
          <Tabs defaultValue="today" className="w-full">
            <TabsList
              className="grid w-full grid-cols-2 gap-1 rounded-xl border border-slate-200 bg-white p-1 sm:inline-flex sm:w-auto"
              data-testid="doctor-command-center-tabs"
            >
              <TabsTrigger
                value="today"
                data-testid="doctor-tab-today"
                className="data-[state=active]:bg-slate-900 data-[state=active]:text-white"
              >
                <CalendarDays className="mr-1.5 h-4 w-4" /> Today
              </TabsTrigger>
              <TabsTrigger
                value="surgery"
                data-testid="doctor-tab-surgery"
                className="data-[state=active]:bg-slate-900 data-[state=active]:text-white"
              >
                <Scissors className="mr-1.5 h-4 w-4" /> Surgery
              </TabsTrigger>
              <TabsTrigger
                value="stock"
                data-testid="doctor-tab-stock"
                className="data-[state=active]:bg-slate-900 data-[state=active]:text-white"
              >
                <Package className="mr-1.5 h-4 w-4" /> Stock
              </TabsTrigger>
              <TabsTrigger
                value="triage"
                data-testid="doctor-tab-triage"
                className="data-[state=active]:bg-slate-900 data-[state=active]:text-white"
              >
                <HeartPulse className="mr-1.5 h-4 w-4" /> Triage
                {pendingTriage > 0 && (
                  <span className="ml-1.5 rounded-full bg-rose-600 px-1.5 text-[10px] font-bold text-white">
                    {pendingTriage}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="today" className="mt-5">
              <AppointmentsTab appointments={appointments} onChange={refetch.appts} />
            </TabsContent>
            <TabsContent value="surgery" className="mt-5">
              <SurgeryTab operations={operations} />
            </TabsContent>
            <TabsContent value="stock" className="mt-5">
              <InventoryTab inventory={inventory} onChange={refetch.inv} />
            </TabsContent>
            <TabsContent value="triage" className="mt-5">
              <TriageFeedTab feed={feed} onChange={refetch.feed} />
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
}
