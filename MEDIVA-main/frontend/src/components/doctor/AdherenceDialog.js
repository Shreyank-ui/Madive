import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  CartesianGrid,
} from "recharts";
import { Activity, TrendingUp, Loader2, Pill } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { getWeeklyAdherence } from "@/lib/api";

function barColor(pct) {
  if (pct >= 80) return "#059669"; // emerald-600
  if (pct >= 50) return "#0284c7"; // sky-600
  if (pct > 0) return "#d97706"; // amber-600
  return "#e2e8f0"; // slate-200 (no data)
}

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-md">
      <div className="font-semibold text-slate-900">{d.label}</div>
      <div className="text-slate-600">
        {d.total ? `${d.taken}/${d.total} doses · ${d.pct}%` : "No doses scheduled"}
      </div>
    </div>
  );
}

export default function AdherenceDialog({ patient, open, onOpenChange }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!open || !patient?.id) return;
    setLoading(true);
    getWeeklyAdherence(patient.id)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [open, patient]);

  const weekly = data?.weeklyPct ?? 0;
  const tone =
    weekly >= 80 ? "text-emerald-700" : weekly >= 50 ? "text-sky-700" : "text-amber-700";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg" data-testid="doctor-adherence-dialog">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-sky-600" /> Medication Adherence
          </DialogTitle>
          <DialogDescription>
            {patient?.full_name} · last 7 days of medicine dose logs
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex h-56 items-center justify-center text-slate-400">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : !data || data.total === 0 ? (
          <div className="flex h-56 flex-col items-center justify-center text-center text-sm text-slate-500">
            <Pill className="mb-2 h-6 w-6 text-slate-300" />
            No dose logs recorded in the last 7 days.
          </div>
        ) : (
          <div>
            {/* Summary */}
            <div className="mb-4 grid grid-cols-3 gap-3">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <div className="text-xs text-slate-400">Weekly</div>
                <div className={`tnum text-2xl font-semibold ${tone}`}>{weekly}%</div>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <div className="text-xs text-slate-400">Doses taken</div>
                <div className="tnum text-2xl font-semibold text-slate-900">{data.taken}</div>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <div className="text-xs text-slate-400">Scheduled</div>
                <div className="tnum text-2xl font-semibold text-slate-900">{data.total}</div>
              </div>
            </div>

            {/* Chart */}
            <div className="h-56 w-full" data-testid="doctor-adherence-chart">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.series} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 12, fill: "#64748b" }}
                  />
                  <YAxis
                    domain={[0, 100]}
                    ticks={[0, 50, 100]}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 12, fill: "#94a3b8" }}
                    unit="%"
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f8fafc" }} />
                  <Bar dataKey="pct" radius={[6, 6, 0, 0]} maxBarSize={38}>
                    {data.series.map((entry, i) => (
                      <Cell key={i} fill={barColor(entry.total ? entry.pct : 0)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-3 flex items-center justify-center gap-4 text-[11px] text-slate-500">
              <span className="flex items-center gap-1">
                <span className="h-2.5 w-2.5 rounded-sm bg-emerald-600" /> ≥80%
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2.5 w-2.5 rounded-sm bg-sky-600" /> 50–79%
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2.5 w-2.5 rounded-sm bg-amber-600" /> &lt;50%
              </span>
              <span className="flex items-center gap-1">
                <Activity className="h-3 w-3" /> daily %
              </span>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
