import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Bell, Check, Clock, Pill } from "lucide-react";
import { Button } from "@/components/ui/button";
import { setDoseTaken } from "@/lib/api";
import { parseTimeToToday, classifyDaypart, humanCountdown } from "@/lib/format";

export default function MedicineReminders({ doseLogs, onChange }) {
  const [snoozed, setSnoozed] = useState({}); // logId -> Date
  const [, setTick] = useState(0);

  // Re-render every 30s so countdown stays live
  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 30000);
    return () => clearInterval(t);
  }, []);

  const effectiveTime = (log) =>
    snoozed[log.id] || parseTimeToToday(log.scheduled_time) || new Date();

  // Display chronologically (Morning -> Afternoon -> Night)
  const ordered = useMemo(
    () =>
      [...doseLogs].sort(
        (a, b) =>
          (parseTimeToToday(a.scheduled_time)?.getTime() || 0) -
          (parseTimeToToday(b.scheduled_time)?.getTime() || 0)
      ),
    [doseLogs]
  );

  const total = doseLogs.length;
  const taken = doseLogs.filter((d) => d.is_taken).length;
  const pct = total ? Math.round((taken / total) * 100) : 0;

  const nextDose = useMemo(() => {
    const now = Date.now();
    const pending = doseLogs
      .filter((d) => !d.is_taken)
      .map((d) => ({ d, t: effectiveTime(d).getTime() }))
      .sort((a, b) => a.t - b.t);
    const upcoming = pending.find((p) => p.t >= now);
    return (upcoming || pending[0])?.d || null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doseLogs, snoozed]);

  async function markTaken(log) {
    try {
      await setDoseTaken(log.id, true);
      toast.success(`Marked ${log.medicine_name} as taken`);
      onChange?.();
    } catch (e) {
      toast.error("Could not update. Try again.");
    }
  }

  function snooze(log) {
    setSnoozed((prev) => ({ ...prev, [log.id]: new Date(Date.now() + 15 * 60000) }));
    toast.message("Snoozed 15 minutes", { description: log.medicine_name });
  }

  const barColor = pct >= 80 ? "bg-emerald-600" : pct >= 50 ? "bg-sky-600" : "bg-amber-500";

  if (!total) {
    return (
      <div
        className="rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm"
        data-testid="patient-medicine-empty"
      >
        <Pill className="mx-auto h-6 w-6 text-slate-300" />
        <p className="mt-2 text-sm text-slate-500">No reminders due right now.</p>
      </div>
    );
  }

  const countdownStr = nextDose ? humanCountdown(effectiveTime(nextDose)) : null;

  return (
    <div className="space-y-3" data-testid="patient-medicine-reminder-card">
      {/* Active alert banner */}
      {nextDose && (
        <div className="rounded-xl border border-sky-200 bg-sky-50 p-4">
          <div className="flex items-center gap-2 text-sky-700">
            <Bell className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-wide">Next Dose</span>
          </div>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="tnum text-2xl font-semibold text-slate-900">
              {countdownStr ? `in ${countdownStr}` : "Due now"}
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-600" data-testid="patient-next-dose-countdown">
            {nextDose.medicine_name} ({nextDose.dosage_quantity}) at {nextDose.scheduled_time}
          </p>
        </div>
      )}

      {/* Adherence */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>Today's adherence</span>
          <span data-testid="patient-adherence-percentage" className="tnum font-medium text-slate-700">
            {taken} of {total} doses taken
          </span>
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className={`h-full rounded-full ${barColor} transition-all duration-300`}
            style={{ width: `${pct}%` }}
            data-testid="patient-adherence-progress"
          />
        </div>
      </div>

      {/* Dose checklist */}
      <div className="space-y-2">
        {ordered.map((log) => {
          const dp = classifyDaypart(log.scheduled_time);
          return (
            <div
              key={log.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm"
              data-testid="patient-dose-checklist-item"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-base ${
                    log.is_taken ? "bg-emerald-50" : "bg-slate-50"
                  }`}
                  title={dp.label}
                >
                  <span>{dp.emoji}</span>
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-slate-900">
                    {log.medicine_name}
                  </div>
                  <div className="text-xs text-slate-500">
                    {log.dosage_quantity} · {dp.label} · {log.scheduled_time}
                  </div>
                </div>
              </div>
              {log.is_taken ? (
                <span className="inline-flex items-center gap-1 rounded-md border border-emerald-500 bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">
                  <Check className="h-3.5 w-3.5" /> Taken
                </span>
              ) : (
                <div className="flex items-center gap-1.5">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-9 border-slate-300 px-2 text-slate-600"
                    onClick={() => snooze(log)}
                    data-testid="patient-dose-snooze"
                  >
                    <Clock className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">15m</span>
                  </Button>
                  <Button
                    size="sm"
                    className="h-9 bg-sky-600 px-3 hover:bg-sky-700"
                    onClick={() => markTaken(log)}
                    data-testid="patient-dose-mark-taken"
                  >
                    <Check className="h-3.5 w-3.5" /> Taken
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
