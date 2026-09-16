import React, { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  HeartPulse,
  Thermometer,
  ImagePlus,
  Loader2,
  Phone,
  Siren,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { TriageBadge } from "@/components/Brand";
import { SYMPTOM_TAGS, computeTriageTier, TRIAGE_META } from "@/lib/triage";
import { submitInterimUpdate, uploadWoundPhoto } from "@/lib/api";

const PAIN_EMOJI = ["😀", "🙂", "🙂", "😐", "😐", "😕", "😣", "😣", "😖", "😫", "😭"];

export default function InterimCheckIn({ ehr, patientId, doctorId, doctorPhone, onSubmitted }) {
  const [pain, setPain] = useState([2]);
  const [temp, setTemp] = useState("98.6");
  const [meds, setMeds] = useState(true);
  const [tags, setTags] = useState(["No unusual symptoms"]);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState(null);

  const tier = useMemo(
    () =>
      computeTriageTier({
        pain_score: pain[0],
        temperature_f: parseFloat(temp) || 98.6,
        symptom_tags: tags,
        medications_taken: meds,
      }),
    [pain, temp, tags, meds]
  );

  function onFile(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  async function submit() {
    if (!ehr) {
      toast.error("A health record is required before check-in.");
      return;
    }
    setSaving(true);
    try {
      let wound_photo_url = null;
      if (file) {
        try {
          wound_photo_url = await uploadWoundPhoto(file);
        } catch {
          toast.message("Photo upload skipped", { description: "Continuing without image." });
        }
      }
      const computed = computeTriageTier({
        pain_score: pain[0],
        temperature_f: parseFloat(temp) || 98.6,
        symptom_tags: tags,
        medications_taken: meds,
      });
      await submitInterimUpdate({
        ehr_record_id: ehr.id,
        patient_id: patientId,
        doctor_id: doctorId,
        pain_score: pain[0],
        temperature_f: parseFloat(temp) || 98.6,
        medications_taken: meds,
        symptom_tags: tags,
        patient_notes: null,
        wound_photo_url,
        triage_tier: computed,
        is_reviewed: false,
      });
      setResult(computed);
      toast.success("Check-in submitted");
      onSubmitted?.();
    } catch (e) {
      toast.error(e.message || "Could not submit check-in.");
    } finally {
      setSaving(false);
    }
  }

  function reset() {
    setResult(null);
    setPain([2]);
    setTemp("98.6");
    setMeds(true);
    setTags(["No unusual symptoms"]);
    setFile(null);
    setPreview(null);
  }

  const telClinic = `tel:${(doctorPhone || "+91 123456789").replace(/\s/g, "")}`;

  if (result) {
    const meta = TRIAGE_META[result];
    return (
      <div
        className={`rounded-xl border-l-4 bg-white p-5 shadow-sm ${meta.ring}`}
        data-testid="patient-triage-result-card"
      >
        <div className="flex items-center gap-2">
          <span className="text-xl">{meta.emoji}</span>
          <TriageBadge tier={result} dataTestId="patient-triage-result-status-badge" />
        </div>
        <h3 className="mt-3 text-base font-semibold text-slate-900">{meta.headline}</h3>
        <p className="mt-1 text-sm text-slate-600">{meta.body}</p>

        {result === "red" && (
          <div className="mt-4 space-y-2">
            <a href={telClinic} data-testid="patient-triage-call-doctor">
              <Button className="h-11 w-full bg-rose-600 hover:bg-rose-700">
                <Phone className="h-4 w-4" /> Call Dr. Shourya: {doctorPhone || "+91 123456789"}
              </Button>
            </a>
            <a href="tel:112" data-testid="patient-triage-emergency">
              <Button variant="outline" className="h-11 w-full border-rose-500 text-rose-700">
                <Siren className="h-4 w-4" /> Emergency Dial: 112 / 108
              </Button>
            </a>
          </div>
        )}

        <Button
          variant="ghost"
          className="mt-4 text-slate-500"
          onClick={reset}
          data-testid="patient-checkin-new"
        >
          <RotateCcw className="h-4 w-4" /> Submit another check-in
        </Button>
      </div>
    );
  }

  return (
    <div
      className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
      data-testid="patient-checkin-card"
    >
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-400">
        <HeartPulse className="h-3.5 w-3.5" /> 45-Second Recovery Check-In
      </div>

      {/* Pain slider */}
      <div className="mt-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-700">Pain level</span>
          <span className="tnum text-sm font-semibold text-slate-900">
            {PAIN_EMOJI[pain[0]]} {pain[0]}/10
          </span>
        </div>
        <Slider
          value={pain}
          onValueChange={setPain}
          min={0}
          max={10}
          step={1}
          className="mt-3"
          data-testid="patient-pain-slider"
        />
        <div className="mt-1 flex justify-between text-[11px] text-slate-400">
          <span>No pain</span>
          <span>Worst</span>
        </div>
      </div>

      {/* Temperature */}
      <div className="mt-5 space-y-1.5">
        <span className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
          <Thermometer className="h-4 w-4 text-sky-600" /> Temperature (°F)
        </span>
        <Input
          type="number"
          step="0.1"
          value={temp}
          onChange={(e) => setTemp(e.target.value)}
          className="h-11 w-32"
          data-testid="patient-temperature-input"
        />
      </div>

      {/* Meds toggle */}
      <div className="mt-5">
        <span className="text-sm font-medium text-slate-700">
          Did you take your prescribed drops/medicines today?
        </span>
        <div className="mt-2 flex gap-2">
          <Button
            type="button"
            variant={meds ? "default" : "outline"}
            className={`h-10 flex-1 ${meds ? "bg-sky-600 hover:bg-sky-700" : "border-slate-300"}`}
            onClick={() => setMeds(true)}
            data-testid="patient-meds-yes"
          >
            Yes
          </Button>
          <Button
            type="button"
            variant={!meds ? "default" : "outline"}
            className={`h-10 flex-1 ${!meds ? "bg-slate-900 hover:bg-slate-800" : "border-slate-300"}`}
            onClick={() => setMeds(false)}
            data-testid="patient-meds-no"
          >
            No
          </Button>
        </div>
      </div>

      {/* Symptom tags */}
      <div className="mt-5">
        <span className="text-sm font-medium text-slate-700">Any symptoms?</span>
        <ToggleGroup
          type="multiple"
          value={tags}
          onValueChange={(v) => setTags(v.length ? v : ["No unusual symptoms"])}
          className="mt-2 flex flex-wrap justify-start gap-2"
          data-testid="patient-symptom-tags"
        >
          {SYMPTOM_TAGS.map((t) => (
            <ToggleGroupItem
              key={t}
              value={t}
              className="h-auto rounded-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 data-[state=on]:border-sky-300 data-[state=on]:bg-sky-50 data-[state=on]:text-slate-900"
            >
              {t}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      {/* Photo upload */}
      <div className="mt-5">
        <span className="text-sm font-medium text-slate-700">Optional eye/wound photo</span>
        <label className="mt-2 flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-slate-300 bg-white p-4 hover:bg-slate-50">
          {preview ? (
            <img
              src={preview}
              alt="preview"
              className="h-14 w-14 rounded-lg object-cover"
              data-testid="patient-photo-preview"
            />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-slate-100 text-slate-400">
              <ImagePlus className="h-5 w-5" />
            </div>
          )}
          <span className="text-sm text-slate-500">
            {file ? file.name : "Tap to add a photo (optional)"}
          </span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onFile}
            data-testid="patient-photo-upload-input"
          />
        </label>
      </div>

      {/* Live triage preview + submit */}
      <div className="mt-5 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          Live assessment: <TriageBadge tier={tier} />
        </div>
      </div>
      <Button
        onClick={submit}
        disabled={saving}
        className="mt-3 h-11 w-full bg-sky-600 hover:bg-sky-700"
        data-testid="patient-checkin-submit-button"
      >
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit Check-In"}
      </Button>
    </div>
  );
}
