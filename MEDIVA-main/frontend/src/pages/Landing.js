import React from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  ShieldCheck,
  CalendarClock,
  Stethoscope,
  Pill,
  HeartPulse,
  ArrowRight,
  Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MedivaLogo } from "@/components/Brand";

const FEATURES = [
  {
    icon: Stethoscope,
    title: "Smart Symptom Triage",
    body: "Describe your condition and get instantly matched to the right specialist.",
  },
  {
    icon: Pill,
    title: "Medicine Reminders",
    body: "Never miss a dose with countdowns, checklists and daily adherence tracking.",
  },
  {
    icon: HeartPulse,
    title: "Recovery Check-Ins",
    body: "45-second daily updates with instant triage guidance between visits.",
  },
  {
    icon: CalendarClock,
    title: "Clinical Command Center",
    body: "A focused cockpit for doctors: rosters, surgeries, stock and triage feeds.",
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <MedivaLogo />
          <div className="flex items-center gap-2">
            <Link to="/login">
              <Button variant="ghost" className="text-slate-700" data-testid="nav-login-button">
                Sign in
              </Button>
            </Link>
            <Link to="/book">
              <Button className="bg-sky-600 hover:bg-sky-700" data-testid="nav-book-button">
                Book Appointment
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 pt-14 pb-10 sm:px-6 sm:pt-20">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
          <div className="animate-fade-up">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 shadow-sm">
              <ShieldCheck className="h-3.5 w-3.5 text-sky-600" />
              Enterprise-grade hospital platform
            </div>
            <h1 className="mt-5 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              Clinical care, <span className="text-sky-600">coordinated.</span>
            </h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-slate-600">
              MEDIVA AI connects patients and clinicians in one calm, precise workspace — from smart
              triage and booking to medication adherence, recovery check-ins and a full doctor
              command center.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link to="/book">
                <Button
                  className="h-11 bg-sky-600 px-6 hover:bg-sky-700"
                  data-testid="hero-book-button"
                >
                  Start with Symptom Triage
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/login">
                <Button
                  variant="outline"
                  className="h-11 border-slate-300 px-6"
                  data-testid="hero-login-button"
                >
                  Portal Sign in
                </Button>
              </Link>
            </div>
            <div className="mt-6 flex items-center gap-2 text-sm text-slate-500">
              <Phone className="h-4 w-4 text-slate-400" />
              24×7 Clinic Helpline: <span className="font-medium text-slate-700">+91 123456789</span>
            </div>
          </div>

          {/* Hero card */}
          <div className="animate-fade-up rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-sky-50 text-sky-700">
                <Activity className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-900">Your care, at a glance</div>
                <div className="text-xs text-slate-500">Live clinical dashboard preview</div>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {FEATURES.map((f) => (
                <div
                  key={f.title}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                >
                  <f.icon className="h-5 w-5 text-sky-600" />
                  <div className="mt-2 text-sm font-semibold text-slate-900">{f.title}</div>
                  <div className="mt-1 text-xs leading-5 text-slate-500">{f.body}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <footer className="mx-auto max-w-6xl px-4 py-10 text-center text-xs text-slate-400 sm:px-6">
        © {new Date().getFullYear()} MEDIVA AI · Enterprise Clinical Suite
      </footer>
    </div>
  );
}
