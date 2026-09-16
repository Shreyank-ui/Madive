import React, { useState } from "react";
import { toast } from "sonner";
import dayjs from "dayjs";
import {
  FileText,
  Pill,
  CalendarClock,
  CheckCircle2,
  Mail,
  MessageCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { rescheduleFollowUp } from "@/lib/api";
import { formatDateTime } from "@/lib/format";

const TIME_SLOTS = [
  "09:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "02:00 PM",
  "03:00 PM",
  "04:00 PM",
  "05:00 PM",
];

export default function EhrCard({ ehr, onChange }) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(new Date());
  const [slot, setSlot] = useState("10:00 AM");
  const [saving, setSaving] = useState(false);

  if (!ehr) {
    return (
      <div
        className="rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm"
        data-testid="patient-ehr-empty"
      >
        <FileText className="mx-auto h-6 w-6 text-slate-300" />
        <p className="mt-2 text-sm text-slate-500">
          No health record yet. Your doctor will publish it after your consultation.
        </p>
      </div>
    );
  }

  const prescriptions = Array.isArray(ehr.prescriptions) ? ehr.prescriptions : [];

  async function handleReschedule() {
    setSaving(true);
    try {
      const [time, mer] = slot.split(" ");
      let [h, m] = time.split(":").map(Number);
      if (mer === "PM" && h < 12) h += 12;
      if (mer === "AM" && h === 12) h = 0;
      const iso = dayjs(date).hour(h).minute(m).second(0).toISOString();
      await rescheduleFollowUp(ehr.id, iso);
      toast.success("Follow-up rescheduled");
      setOpen(false);
      onChange?.();
    } catch (e) {
      toast.error("Could not reschedule. Try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
      data-testid="patient-ehr-card"
    >
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-400">
        <FileText className="h-3.5 w-3.5" /> Health Record
      </div>

      <h3 className="mt-2 text-base font-semibold text-slate-900">{ehr.diagnosis}</h3>
      {ehr.clinical_notes && (
        <p className="mt-1 text-sm leading-6 text-slate-600">{ehr.clinical_notes}</p>
      )}

      {/* Dispatched status */}
      {(ehr.dispatched_to_email || ehr.dispatched_to_mobile) && (
        <div className="mt-3 inline-flex flex-wrap items-center gap-2 rounded-lg border border-emerald-500 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Dispatched to your
          {ehr.dispatched_to_email && (
            <span className="inline-flex items-center gap-1">
              <Mail className="h-3.5 w-3.5" /> Email
            </span>
          )}
          {ehr.dispatched_to_email && ehr.dispatched_to_mobile && "&"}
          {ehr.dispatched_to_mobile && (
            <span className="inline-flex items-center gap-1">
              <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
            </span>
          )}
        </div>
      )}

      {/* Prescriptions */}
      {prescriptions.length > 0 && (
        <div className="mt-4">
          <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-800">
            <Pill className="h-4 w-4 text-sky-600" /> Prescription
          </div>
          <ul className="mt-2 divide-y divide-slate-100" data-testid="patient-prescriptions-list">
            {prescriptions.map((p, i) => (
              <li key={i} className="flex items-start justify-between gap-3 py-2.5">
                <div>
                  <div className="text-sm font-medium text-slate-900">{p.name}</div>
                  <div className="text-xs text-slate-500">
                    {p.quantity} · {p.timing}
                  </div>
                </div>
                {Array.isArray(p.schedule) && (
                  <div className="flex flex-wrap justify-end gap-1">
                    {p.schedule.map((t) => (
                      <span
                        key={t}
                        className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[11px] text-slate-600"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Next follow-up */}
      {ehr.next_follow_up_datetime && (
        <div className="mt-4 flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <CalendarClock className="h-5 w-5 text-sky-600" />
            <div>
              <div className="text-xs text-slate-500">
                Next Follow-Up {ehr.follow_up_rescheduled && "(rescheduled)"}
              </div>
              <div className="text-sm font-semibold text-slate-900">
                {formatDateTime(ehr.next_follow_up_datetime)}
              </div>
            </div>
          </div>
          <Button
            variant="outline"
            className="h-10 border-slate-300"
            onClick={() => setOpen(true)}
            data-testid="patient-reschedule-button"
          >
            <CalendarClock className="h-4 w-4" /> Reschedule
          </Button>
        </div>
      )}

      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent data-testid="patient-reschedule-drawer">
          <div className="mx-auto w-full max-w-md">
            <DrawerHeader>
              <DrawerTitle>Reschedule your follow-up</DrawerTitle>
            </DrawerHeader>
            <div className="flex flex-col items-center gap-4 px-4 pb-2">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(d) => d && setDate(d)}
                disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
                className="rounded-xl border border-slate-200 bg-white p-3"
                data-testid="patient-reschedule-calendar"
              />
              <div className="w-full space-y-1.5">
                <span className="text-sm text-slate-600">Time slot</span>
                <Select value={slot} onValueChange={setSlot}>
                  <SelectTrigger className="h-11" data-testid="patient-reschedule-slot">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_SLOTS.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DrawerFooter>
              <Button
                onClick={handleReschedule}
                disabled={saving}
                className="h-11 bg-sky-600 hover:bg-sky-700"
                data-testid="patient-reschedule-confirm"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirm New Date"}
              </Button>
              <DrawerClose asChild>
                <Button variant="ghost">Cancel</Button>
              </DrawerClose>
            </DrawerFooter>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
