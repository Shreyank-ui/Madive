import React, { useMemo, useState } from "react";
import { toast } from "sonner";
import dayjs from "dayjs";
import {
  Stethoscope,
  Search,
  Plus,
  Trash2,
  Loader2,
  Send,
  Phone,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { StatusPill } from "@/components/Brand";
import AdherenceDialog from "@/components/doctor/AdherenceDialog";
import { completeConsultation } from "@/lib/api";
import { formatDateTime } from "@/lib/format";
import { TrendingUp } from "lucide-react";

const SLOTS = [
  { key: "morning", time: "08:00 AM", label: "🌅 Morning" },
  { key: "afternoon", time: "01:00 PM", label: "☀️ Afternoon" },
  { key: "night", time: "08:00 PM", label: "🌙 Night" },
];

const statusTone = { scheduled: "sky", completed: "emerald", cancelled: "rose" };

export default function AppointmentsTab({ appointments, onChange }) {
  const [q, setQ] = useState("");
  const [active, setActive] = useState(null);
  const [adherencePatient, setAdherencePatient] = useState(null);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return appointments;
    return appointments.filter(
      (a) =>
        a.patient?.full_name?.toLowerCase().includes(s) ||
        a.problem_description?.toLowerCase().includes(s) ||
        a.patient?.phone_number?.toLowerCase().includes(s)
    );
  }, [q, appointments]);

  return (
    <div className="space-y-4">
      <div
        className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between"
        data-testid="doctor-appointments-filters"
      >
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Today's Appointments</h2>
          <p className="text-sm text-slate-500">
            {appointments.length} patient{appointments.length === 1 ? "" : "s"} on the roster
          </p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search patients or symptoms"
            className="h-10 pl-9"
            data-testid="doctor-appointments-search-input"
          />
        </div>
      </div>

      <div
        className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
        data-testid="doctor-appointments-table"
      >
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="text-xs uppercase tracking-wide text-slate-600">Time</TableHead>
              <TableHead className="text-xs uppercase tracking-wide text-slate-600">Patient</TableHead>
              <TableHead className="hidden text-xs uppercase tracking-wide text-slate-600 md:table-cell">
                Phone
              </TableHead>
              <TableHead className="text-xs uppercase tracking-wide text-slate-600">
                Stated Problem
              </TableHead>
              <TableHead className="text-xs uppercase tracking-wide text-slate-600">Status</TableHead>
              <TableHead className="text-right text-xs uppercase tracking-wide text-slate-600">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-sm text-slate-500">
                  No appointments found.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((a) => (
                <TableRow key={a.id} className="hover:bg-slate-50">
                  <TableCell className="whitespace-nowrap text-sm text-slate-700">
                    {dayjs(a.appointment_datetime).format("DD MMM, hh:mm A")}
                  </TableCell>
                  <TableCell className="text-sm font-medium text-slate-900">
                    {a.patient?.full_name || "—"}
                  </TableCell>
                  <TableCell className="hidden text-sm text-slate-600 md:table-cell">
                    {a.patient?.phone_number || "—"}
                  </TableCell>
                  <TableCell className="max-w-[260px] text-sm text-slate-700">
                    <span className="line-clamp-2">{a.problem_description}</span>
                  </TableCell>
                  <TableCell>
                    <StatusPill tone={statusTone[a.status] || "slate"}>{a.status}</StatusPill>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {a.patient && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-9 border-slate-300 px-2 text-slate-600"
                          onClick={() => setAdherencePatient(a.patient)}
                          data-testid="doctor-view-adherence-button"
                          title="View medication adherence"
                        >
                          <TrendingUp className="h-3.5 w-3.5" />
                          <span className="hidden lg:inline">Adherence</span>
                        </Button>
                      )}
                      {a.status === "scheduled" ? (
                        <Button
                          size="sm"
                          className="h-9 bg-sky-600 hover:bg-sky-700"
                          onClick={() => setActive(a)}
                          data-testid="doctor-open-consultation-button"
                        >
                          <Stethoscope className="h-3.5 w-3.5" /> Start Consult
                        </Button>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                          <FileText className="h-3.5 w-3.5" /> EHR issued
                        </span>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {active && (
        <ConsultationDialog
          appointment={active}
          onClose={() => setActive(null)}
          onDone={() => {
            setActive(null);
            onChange?.();
          }}
        />
      )}

      <AdherenceDialog
        patient={adherencePatient}
        open={!!adherencePatient}
        onOpenChange={(o) => !o && setAdherencePatient(null)}
      />
    </div>
  );
}

function ConsultationDialog({ appointment, onClose, onDone }) {
  const [diagnosis, setDiagnosis] = useState("");
  const [notes, setNotes] = useState("");
  const [followUp, setFollowUp] = useState(
    dayjs().add(7, "day").hour(10).minute(0).format("YYYY-MM-DDTHH:mm")
  );
  const [rx, setRx] = useState([
    { name: "", quantity: "1 drop", slots: { morning: true, afternoon: true, night: true } },
  ]);
  const [saving, setSaving] = useState(false);

  function addRx() {
    setRx([...rx, { name: "", quantity: "1 drop", slots: { morning: true, afternoon: false, night: true } }]);
  }
  function removeRx(i) {
    setRx(rx.filter((_, idx) => idx !== i));
  }
  function updateRx(i, patch) {
    setRx(rx.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  }
  function toggleSlot(i, key) {
    setRx(rx.map((r, idx) => (idx === i ? { ...r, slots: { ...r.slots, [key]: !r.slots[key] } } : r)));
  }

  async function save() {
    if (!diagnosis.trim()) return toast.error("Please enter a diagnosis.");
    const prescriptions = rx
      .filter((r) => r.name.trim())
      .map((r) => {
        const schedule = SLOTS.filter((s) => r.slots[s.key]).map((s) => s.time);
        return {
          name: r.name.trim(),
          quantity: r.quantity || "1 dose",
          timing: `${schedule.length} time${schedule.length === 1 ? "" : "s"} daily`,
          schedule,
        };
      });
    if (prescriptions.length === 0)
      return toast.error("Add at least one prescribed medicine.");

    setSaving(true);
    try {
      await completeConsultation({
        appointment,
        diagnosis: diagnosis.trim(),
        clinical_notes: notes.trim(),
        prescriptions,
        next_follow_up_datetime: dayjs(followUp).toISOString(),
      });
      toast.success("EHR dispatched to patient's email & WhatsApp");
      onDone?.();
    } catch (e) {
      toast.error(e.message || "Could not save consultation.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto" data-testid="doctor-consultation-dialog">
        <DialogHeader>
          <DialogTitle>Consultation · {appointment.patient?.full_name}</DialogTitle>
          <DialogDescription>
            Record the diagnosis, prescribe medicines and dispatch the EHR to the patient.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {/* Left: context */}
          <div className="space-y-3">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <div className="text-xs text-slate-400">Scheduled</div>
              <div className="text-sm font-medium text-slate-800">
                {formatDateTime(appointment.appointment_datetime)}
              </div>
              {appointment.patient?.phone_number && (
                <a
                  href={`tel:${appointment.patient.phone_number.replace(/\s/g, "")}`}
                  className="mt-1 inline-flex items-center gap-1 text-xs text-sky-700 hover:underline"
                >
                  <Phone className="h-3.5 w-3.5" /> {appointment.patient.phone_number}
                </a>
              )}
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-3">
              <div className="text-xs text-slate-400">Stated Problem</div>
              <div className="mt-1 text-sm text-slate-700">{appointment.problem_description}</div>
            </div>
            <div className="space-y-1.5">
              <Label>Diagnosis</Label>
              <Input
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                placeholder="e.g. Acute Allergic Conjunctivitis"
                className="h-11"
                data-testid="doctor-consultation-diagnosis"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Clinical notes</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Observations, advice, care instructions…"
                className="min-h-24 resize-none"
                data-testid="doctor-consultation-notes-textarea"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Next follow-up</Label>
              <Input
                type="datetime-local"
                value={followUp}
                onChange={(e) => setFollowUp(e.target.value)}
                className="h-11"
                data-testid="doctor-consultation-followup"
              />
            </div>
          </div>

          {/* Right: prescriptions */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Prescriptions</Label>
              <Button
                size="sm"
                variant="outline"
                className="h-8 border-slate-300"
                onClick={addRx}
                data-testid="doctor-add-prescription"
              >
                <Plus className="h-3.5 w-3.5" /> Add
              </Button>
            </div>
            <div className="space-y-3">
              {rx.map((r, i) => (
                <div key={i} className="rounded-lg border border-slate-200 bg-white p-3">
                  <div className="flex items-center gap-2">
                    <Input
                      value={r.name}
                      onChange={(e) => updateRx(i, { name: e.target.value })}
                      placeholder="Medicine name"
                      className="h-10"
                      data-testid="doctor-rx-name"
                    />
                    {rx.length > 1 && (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-10 w-10 shrink-0 text-slate-400 hover:text-rose-600"
                        onClick={() => removeRx(i)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <Input
                    value={r.quantity}
                    onChange={(e) => updateRx(i, { quantity: e.target.value })}
                    placeholder="Dosage, e.g. 1 drop"
                    className="mt-2 h-10"
                    data-testid="doctor-rx-quantity"
                  />
                  <div className="mt-2 flex flex-wrap gap-3">
                    {SLOTS.map((s) => (
                      <label
                        key={s.key}
                        className="flex cursor-pointer items-center gap-1.5 text-sm text-slate-600"
                      >
                        <Checkbox
                          checked={!!r.slots[s.key]}
                          onCheckedChange={() => toggleSlot(i, s.key)}
                        />
                        {s.label}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={save}
            disabled={saving}
            className="bg-sky-600 hover:bg-sky-700"
            data-testid="doctor-consultation-save-button"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Send className="h-4 w-4" /> Discharge &amp; Dispatch EHR
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
