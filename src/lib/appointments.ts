import { supabase } from "./supabase";
import { SLOTS, isPast } from "./time";
import type { Appointment, Cancellation, WaitlistEntry } from "./status";

const COLUMNS = "id, client_name, phone, date, time, status, confirmed, running_late";

// Postgres returns time as "HH:MM:SS"; the app works with "HH:MM".
const clean = (rows: Appointment[] | null): Appointment[] =>
  (rows ?? []).map((r) => ({ ...r, time: r.time.slice(0, 5) }));

export async function listAll() {
  const { data, error } = await supabase
    .from("appointments")
    .select(COLUMNS)
    .order("date")
    .order("time");
  if (error) throw error;
  // ponytail: fetches every row, add pagination / date range once a practice has thousands
  return clean(data as Appointment[]);
}

export async function listForPhone(phone: string) {
  const { data, error } = await supabase
    .from("appointments")
    .select(COLUMNS)
    .eq("phone", phone)
    .order("date")
    .order("time");
  if (error) throw error;
  return clean(data as Appointment[]);
}

// Every slot on a day, flagged free when nobody holds it and it's still in the future.
export async function slotsForDate(date: string) {
  const { data, error } = await supabase
    .from("appointments")
    .select("time")
    .eq("date", date)
    .eq("status", "booked");
  if (error) throw error;
  const taken = new Set((data ?? []).map((r) => r.time.slice(0, 5)));
  return SLOTS.map((time) => ({ time, free: !taken.has(time) && !isPast(date, time) }));
}

// Upcoming = still booked and in the future (soonest first); everything else is history (latest first).
export function partition(rows: Appointment[]) {
  const upcoming = rows.filter((a) => a.status === "booked" && !isPast(a.date, a.time));
  const past = rows.filter((a) => !upcoming.includes(a)).reverse();
  return { upcoming, past };
}

export async function listWaitlist() {
  const { data, error } = await supabase
    .from("waitlist")
    .select("id, client_name, phone, date")
    .order("date")
    .order("created_at");
  if (error) throw error;
  return data as WaitlistEntry[];
}

export async function listRecentCancellations(limit = 5) {
  const { data, error } = await supabase
    .from("cancellations")
    .select("id, client_name, date, time, reason, cancelled_at")
    .order("cancelled_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data as Cancellation[]).map((c) => ({ ...c, time: c.time.slice(0, 5) }));
}
