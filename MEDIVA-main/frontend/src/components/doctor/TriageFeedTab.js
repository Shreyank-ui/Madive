import React, { useMemo, useState } from "react";
import { toast } from "sonner";
import dayjs from "dayjs";
import {
  Phone,
  Thermometer,
  Activity,
  CheckCircle2,
  Image as ImageIcon,
  Inbox,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { TriageBadge } from "@/components/Brand";
import { reviewTriage } from "@/lib/api";

const ORDER = { red: 0, yellow: 1, green: 2 };

export default function TriageFeedTab({ feed, onChange }) {
  const [busy, setBusy] = useState(null);

  const sorted = useMemo(() => {
    return [...feed].sort((a, b) => {
      // unreviewed first, then by triage severity, then newest
      if (a.is_reviewed !== b.is_reviewed) return a.is_reviewed ? 1 : -1;
      const t = (ORDER[a.triage_tier] ?? 3) - (ORDER[b.triage_tier] ?? 3);
      if (t !== 0) return t;
      return dayjs(b.submitted_at).valueOf() - dayjs(a.submitted_at).valueOf();
    });
  }, [feed]);

  async function markReviewed(item) {
    setBusy(item.id);
    try {
      await reviewTriage(item.id, "Reviewed by doctor");
      toast.success("Marked as reviewed");
      onChange?.();
    } catch (e) {
      toast.error("Could not update.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-4" data-testid="doctor-triage-feed">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Interim Recovery Triage</h2>
        <p className="text-sm text-slate-500">
          Patient check-ins between visits · red &amp; yellow pinned to top
        </p>
      </div>

      {sorted.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
          <Inbox className="mx-auto mb-2 h-6 w-6 text-slate-300" />
          No check-ins submitted yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {sorted.map((item) => {
            const phone = item.patient?.phone_number || "+91 123456789";
            const highlight =
              item.triage_tier === "red"
                ? "border-rose-300"
                : item.triage_tier === "yellow"
                ? "border-amber-300"
                : "border-slate-200";
            return (
              <div
                key={item.id}
                className={`rounded-xl border bg-white p-4 shadow-sm ${highlight} ${
                  item.is_reviewed ? "opacity-70" : ""
                }`}
                data-testid="doctor-triage-feed-item"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-slate-900">
                      {item.patient?.full_name || "Patient"}
                    </div>
                    <div className="text-xs text-slate-400">
                      {dayjs(item.submitted_at).format("DD MMM, hh:mm A")}
                    </div>
                  </div>
                  <TriageBadge tier={item.triage_tier} />
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-600">
                  <span className="inline-flex items-center gap-1">
                    <Activity className="h-4 w-4 text-slate-400" /> Pain {item.pain_score}/10
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Thermometer className="h-4 w-4 text-slate-400" /> {item.temperature_f}°F
                  </span>
                  <span className="inline-flex items-center gap-1">
                    Meds:{" "}
                    <span className={item.medications_taken ? "text-emerald-700" : "text-rose-700"}>
                      {item.medications_taken ? "Taken" : "Missed"}
                    </span>
                  </span>
                </div>

                {Array.isArray(item.symptom_tags) && item.symptom_tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {item.symptom_tags.map((t) => (
                      <span
                        key={t}
                        className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}

                {item.wound_photo_url && (
                  <a
                    href={item.wound_photo_url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-flex items-center gap-1 text-xs text-sky-700 hover:underline"
                  >
                    <ImageIcon className="h-3.5 w-3.5" /> View submitted photo
                  </a>
                )}

                <div className="mt-4 flex items-center gap-2">
                  <a href={`tel:${phone.replace(/\s/g, "")}`} className="flex-1">
                    <Button
                      size="sm"
                      className={`h-9 w-full ${
                        item.triage_tier === "red"
                          ? "bg-rose-600 hover:bg-rose-700"
                          : "bg-sky-600 hover:bg-sky-700"
                      }`}
                      data-testid="doctor-triage-call-button"
                    >
                      <Phone className="h-3.5 w-3.5" /> Call Patient
                    </Button>
                  </a>
                  {!item.is_reviewed ? (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-9 border-slate-300"
                      disabled={busy === item.id}
                      onClick={() => markReviewed(item)}
                      data-testid="doctor-triage-review-button"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" /> Review
                    </Button>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs text-emerald-600">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Reviewed
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
