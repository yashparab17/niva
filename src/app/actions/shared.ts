import { SLOTS, isPast } from "@/lib/time";

export type Result = { error?: string; ok?: boolean };

export const SLOT_TAKEN = "That time was just taken. Please pick another.";

// Postgres unique violation: the one-booking-per-slot index fired.
export const isSlotClash = (error: { code?: string } | null) => error?.code === "23505";

export function validateSlot(date: string, time: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !SLOTS.includes(time)) return "Please pick a date and time.";
  if (isPast(date, time)) return "That time has already passed.";
}

export const field = (formData: FormData, name: string) => String(formData.get(name) ?? "").trim();
