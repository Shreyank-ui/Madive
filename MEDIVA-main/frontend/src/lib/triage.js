// Client-side keyword-based specialty detection + interim health triage rules.

// Detect the best matching specialty from a free-text description.
// specialties: [{ id, name, keywords: [] }]
export function detectSpecialty(text, specialties = []) {
  const lower = (text || "").toLowerCase();
  let best = null;
  let bestMatches = [];
  for (const sp of specialties) {
    const kws = Array.isArray(sp.keywords) ? sp.keywords : [];
    const matches = kws.filter((k) => k && lower.includes(String(k).toLowerCase()));
    if (matches.length > (bestMatches.length || 0)) {
      best = sp;
      bestMatches = matches;
    }
  }
  if (best && bestMatches.length > 0) {
    return { specialty: best, matchedKeywords: bestMatches, matched: true };
  }
  // Fallback to first specialty (single-specialty demo clinic)
  return {
    specialty: specialties[0] || null,
    matchedKeywords: [],
    matched: false,
  };
}

export const SYMPTOM_TAGS = [
  "No unusual symptoms",
  "Increasing Redness",
  "Mild Drainage",
  "Blurred Vision",
  "Severe Throbbing",
];

const RED_TAGS = ["Blurred Vision", "Severe Throbbing"];
const YELLOW_TAGS = ["Increasing Redness", "Mild Drainage"];

// Compute triage tier from interim check-in values.
export function computeTriageTier({
  pain_score = 0,
  temperature_f = 98.6,
  symptom_tags = [],
  medications_taken = true,
}) {
  const tags = symptom_tags || [];
  const hasRedTag = tags.some((t) => RED_TAGS.includes(t));
  const hasYellowTag = tags.some((t) => YELLOW_TAGS.includes(t));

  if (pain_score >= 8 || temperature_f >= 101 || hasRedTag) return "red";
  if (
    pain_score >= 4 ||
    (temperature_f >= 99.6 && temperature_f < 101) ||
    hasYellowTag ||
    !medications_taken
  )
    return "yellow";
  return "green";
}

export const TRIAGE_META = {
  green: {
    label: "Safe",
    emoji: "🟢",
    headline: "Healing is on track!",
    body: "Dr. Shourya will review your update today.",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-500",
    ring: "border-emerald-500",
  },
  yellow: {
    label: "Watch",
    emoji: "🟡",
    headline: "Update flagged for minor review.",
    body: "Our clinic team will follow up with you within 2 hours.",
    badge: "bg-amber-50 text-amber-700 border-amber-500",
    ring: "border-amber-500",
  },
  red: {
    label: "Critical",
    emoji: "🔴",
    headline: "This needs urgent attention.",
    body: "Please contact your doctor or emergency services immediately.",
    badge: "bg-rose-50 text-rose-700 border-rose-500",
    ring: "border-rose-500",
  },
};
