import React from "react";
import { Activity } from "lucide-react";
import { cn } from "@/lib/utils";

export function MedivaLogo({ className, iconClass, textClass, showText = true }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-white",
          iconClass
        )}
      >
        <Activity className="h-5 w-5" />
      </div>
      {showText && (
        <div className={cn("leading-none", textClass)}>
          <div className="text-base font-bold tracking-tight text-slate-900">
            MEDIVA <span className="text-sky-600">AI</span>
          </div>
          <div className="text-[10px] font-medium uppercase tracking-widest text-slate-400">
            Clinical Suite
          </div>
        </div>
      )}
    </div>
  );
}

const TRIAGE_CLASSES = {
  red: "bg-rose-50 text-rose-700 border-rose-500",
  yellow: "bg-amber-50 text-amber-700 border-amber-500",
  green: "bg-emerald-50 text-emerald-700 border-emerald-500",
};
const TRIAGE_LABELS = { red: "Critical", yellow: "Watch", green: "Safe" };

export function TriageBadge({ tier = "green", label, dataTestId }) {
  const cls = TRIAGE_CLASSES[tier] || TRIAGE_CLASSES.green;
  return (
    <span
      data-testid={dataTestId}
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-semibold",
        cls
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          tier === "red" ? "bg-rose-500" : tier === "yellow" ? "bg-amber-500" : "bg-emerald-500"
        )}
      />
      {label || TRIAGE_LABELS[tier]}
    </span>
  );
}

export function StatusPill({ children, tone = "slate", className }) {
  const tones = {
    slate: "bg-slate-100 text-slate-700 border-slate-200",
    sky: "bg-sky-50 text-sky-700 border-sky-200",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    rose: "bg-rose-50 text-rose-700 border-rose-200",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium capitalize",
        tones[tone] || tones.slate,
        className
      )}
    >
      {children}
    </span>
  );
}
