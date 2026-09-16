import React from "react";
import dayjs from "dayjs";
import { CalendarClock, MapPin, User, Scissors, Target } from "lucide-react";
import { StatusPill } from "@/components/Brand";

const statusTone = { scheduled: "sky", completed: "emerald", cancelled: "rose", "in-progress": "amber" };

function fmtTime(t) {
  // t like "09:30:00"
  return dayjs(`2000-01-01T${t}`).format("hh:mm A");
}

export default function SurgeryTab({ operations }) {
  return (
    <div className="space-y-4" data-testid="doctor-surgery-board">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Operation &amp; Surgery Schedule</h2>
        <p className="text-sm text-slate-500">
          {operations.length} upcoming surgical case{operations.length === 1 ? "" : "s"}
        </p>
      </div>

      {operations.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
          No surgeries scheduled.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {operations.map((op) => (
            <div
              key={op.id}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
              data-testid="doctor-surgery-item"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-50 text-sky-700">
                    <Scissors className="h-4 w-4" />
                  </div>
                  {dayjs(op.operation_date).format("MMM DD, YYYY")}
                </div>
                <StatusPill tone={statusTone[op.status] || "slate"}>{op.status}</StatusPill>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                <div className="flex items-center gap-2 text-slate-600">
                  <CalendarClock className="h-4 w-4 text-slate-400" />
                  {fmtTime(op.start_time)} – {fmtTime(op.end_time)}
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <MapPin className="h-4 w-4 text-slate-400" />
                  {op.operating_theater}
                </div>
                <div className="flex items-center gap-2 text-slate-600 sm:col-span-2">
                  <User className="h-4 w-4 text-slate-400" />
                  {op.patient?.full_name || "Patient"}
                </div>
              </div>

              <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-slate-400">
                  <Target className="h-3.5 w-3.5" /> Motive of Operation
                </div>
                <p className="mt-1 text-sm font-semibold leading-6 text-slate-900">
                  {op.motive_of_operation}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
