// Dates are "YYYY-MM-DD" and times "HH:MM" strings everywhere, always in the clinic's timezone.
const TZ = "Asia/Kolkata";

// Consultation slots: every 30 minutes, 9:00 to 16:30.
export const SLOTS = Array.from({ length: 16 }, (_, i) => {
  const mins = 9 * 60 + i * 30;
  return `${String(Math.floor(mins / 60)).padStart(2, "0")}:${String(mins % 60).padStart(2, "0")}`;
});

const parts = (d: Date) =>
  Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: TZ,
      hourCycle: "h23",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
      .formatToParts(d)
      .map((p) => [p.type, p.value]),
  );

export function nowInClinic() {
  const p = parts(new Date());
  return { date: `${p.year}-${p.month}-${p.day}`, time: `${p.hour}:${p.minute}` };
}

export const addDays = (date: string, n: number) => {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};

// Whole days from `from` to `to` (negative when `to` is earlier).
export const daysBetween = (from: string, to: string) =>
  Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86_400_000);

// Today, unless the last slot has already gone, in which case tomorrow.
export function firstBookableDate() {
  const now = nowInClinic();
  return SLOTS.some((t) => t > now.time) ? now.date : addDays(now.date, 1);
}

// The same weekday one or more weeks on, landing after today.
export const sameTimeNextWeek = (date: string, today: string) =>
  date > today ? date : addDays(date, Math.ceil((daysBetween(date, today) + 1) / 7) * 7);

export const isPast = (date: string, time: string) => {
  const now = nowInClinic();
  return date < now.date || (date === now.date && time <= now.time);
};

const fmtDate = (date: string, opts: Intl.DateTimeFormatOptions) =>
  new Date(`${date}T00:00:00Z`).toLocaleDateString("en-IN", { timeZone: "UTC", ...opts });

export const formatDate = (date: string) =>
  fmtDate(date, { weekday: "short", day: "numeric", month: "short" });
export const formatDateLong = (date: string) =>
  fmtDate(date, { weekday: "long", day: "numeric", month: "long" });
// "October 2026", or "Oct - Nov 2026" when the range crosses a month.
export function monthRange(from: string, to: string) {
  if (from.slice(0, 7) === to.slice(0, 7)) return fmtDate(from, { month: "long", year: "numeric" });
  return `${fmtDate(from, { month: "short" })} - ${fmtDate(to, { month: "short", year: "numeric" })}`;
}
export const weekday = (date: string) => fmtDate(date, { weekday: "short" });
export const dayOfMonth = (date: string) => fmtDate(date, { day: "numeric" });
export const monthShort = (date: string) => fmtDate(date, { month: "short" });

export function formatTime(time: string) {
  const [h, m] = time.split(":").map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h < 12 ? "am" : "pm"}`;
}

export function relativeDay(date: string) {
  const n = daysBetween(nowInClinic().date, date);
  if (n === 0) return "Today";
  if (n === 1) return "Tomorrow";
  return n > 1 ? `In ${n} days` : `${-n} days ago`;
}
