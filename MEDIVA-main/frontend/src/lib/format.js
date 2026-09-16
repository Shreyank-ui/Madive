import dayjs from "dayjs";

// Parse a "08:00 AM" style time string into a Date for a given base day (defaults today).
export function parseTimeToToday(timeStr, baseDate = new Date()) {
  if (!timeStr) return null;
  const m = String(timeStr)
    .trim()
    .match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  const d = dayjs(baseDate);
  if (!m) return null;
  let hour = parseInt(m[1], 10);
  const min = parseInt(m[2], 10);
  const mer = (m[3] || "").toUpperCase();
  if (mer === "PM" && hour < 12) hour += 12;
  if (mer === "AM" && hour === 12) hour = 0;
  return d.hour(hour).minute(min).second(0).millisecond(0).toDate();
}

// Classify a "08:00 AM" time into daypart
export function classifyDaypart(timeStr) {
  const d = parseTimeToToday(timeStr);
  if (!d) return { key: "day", label: "Anytime", emoji: "🕒" };
  const h = d.getHours();
  if (h < 12) return { key: "morning", label: "Morning", emoji: "🌅" };
  if (h < 17) return { key: "afternoon", label: "Afternoon", emoji: "☀️" };
  return { key: "night", label: "Night", emoji: "🌙" };
}

export function formatTime(d) {
  return dayjs(d).format("hh:mm A");
}
export function formatDate(d) {
  return dayjs(d).format("DD MMM YYYY");
}
export function formatDateTime(d) {
  return dayjs(d).format("DD MMM YYYY, hh:mm A");
}
export function todayStr() {
  return dayjs().format("YYYY-MM-DD");
}

// Humanized "in 25 mins" / "in 2 hrs 5 mins" for a future date; null if past
export function humanCountdown(target) {
  const diffMs = dayjs(target).diff(dayjs());
  if (diffMs <= 0) return null;
  const totalMin = Math.round(diffMs / 60000);
  const h = Math.floor(totalMin / 60);
  const mn = totalMin % 60;
  if (h === 0) return `${mn} min${mn === 1 ? "" : "s"}`;
  if (mn === 0) return `${h} hr${h === 1 ? "" : "s"}`;
  return `${h} hr${h === 1 ? "" : "s"} ${mn} min${mn === 1 ? "" : "s"}`;
}

// Inventory expiry classification
export function expiryStatus(expiryDate) {
  const days = dayjs(expiryDate).startOf("day").diff(dayjs().startOf("day"), "day");
  if (days < 0) return { tier: "red", days, label: `Expired ${Math.abs(days)}d ago` };
  if (days < 30) return { tier: "red", days, label: `Expires in ${days}d` };
  if (days < 90) return { tier: "amber", days, label: `Expires in ${days}d` };
  return { tier: "green", days, label: `Expires in ${days}d` };
}

export function initials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("");
}
