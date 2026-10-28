import { SLOTS } from "./time";

const SLOT_MINUTES = 30;
const IST_OFFSET_MINUTES = 330; // India has no daylight saving, so a fixed offset is exact.

// "2026-10-29" + "10:00" (clinic time) -> "20261029T043000Z"
function toUtc(date: string, time: string, plusMinutes = 0) {
  const [h, m] = time.split(":").map(Number);
  const utc = new Date(`${date}T00:00:00Z`);
  utc.setUTCMinutes(h * 60 + m - IST_OFFSET_MINUTES + plusMinutes);
  return utc.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

export function buildIcs(date: string, time: string) {
  if (!SLOTS.includes(time)) throw new Error("Unknown slot");
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//niva//appointments//EN",
    "BEGIN:VEVENT",
    `UID:${date}-${time}@niva`,
    `DTSTAMP:${toUtc(date, time)}`,
    `DTSTART:${toUtc(date, time)}`,
    `DTEND:${toUtc(date, time, SLOT_MINUTES)}`,
    "SUMMARY:Nutrition consultation (niva)",
    "BEGIN:VALARM",
    "ACTION:DISPLAY",
    "DESCRIPTION:Nutrition consultation tomorrow",
    "TRIGGER:-P1D",
    "END:VALARM",
    "BEGIN:VALARM",
    "ACTION:DISPLAY",
    "DESCRIPTION:Nutrition consultation in 1 hour",
    "TRIGGER:-PT1H",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}
