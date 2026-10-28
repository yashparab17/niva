"use server";

import { revalidatePath } from "next/cache";
import { supabase } from "@/lib/supabase";
import { STATUSES, isValidPhone, normalizePhone, type Status } from "@/lib/status";
import { SLOT_TAKEN, field, isSlotClash, type Result } from "./shared";

// ponytail: the brief says no login, so these are open. Put Supabase Auth in front before real use.
const refresh = () => revalidatePath("/", "layout");

export async function addAppointment(_: Result, formData: FormData): Promise<Result> {
  const name = field(formData, "name");
  const rawPhone = field(formData, "phone");
  const phone = rawPhone ? normalizePhone(rawPhone) : null;
  const date = field(formData, "date");
  const time = field(formData, "time");

  if (!name) return { error: "Please enter the client's name." };
  if (phone && !isValidPhone(phone)) return { error: "Phone should be 10 digits, or leave it blank." };
  if (!date || !time) return { error: "Pick a date and a time." };

  const { error } = await supabase
    .from("appointments")
    .insert({ client_name: name, phone, date, time });
  if (isSlotClash(error)) return { error: SLOT_TAKEN };
  if (error) throw error;

  refresh();
  return { ok: true };
}

export async function setStatus(id: string, status: Status): Promise<Result> {
  if (!STATUSES.includes(status)) return { error: "Unknown status." };

  const { error } = await supabase.from("appointments").update({ status }).eq("id", id);
  if (isSlotClash(error)) return { error: "Another client is already booked in that slot." };
  if (error) throw error;

  refresh();
  return { ok: true };
}

export async function removeAppointment(id: string): Promise<Result> {
  const { error } = await supabase.from("appointments").delete().eq("id", id);
  if (error) throw error;

  refresh();
  return { ok: true };
}

export async function removeWaitlistEntry(id: string): Promise<Result> {
  const { error } = await supabase.from("waitlist").delete().eq("id", id);
  if (error) throw error;

  refresh();
  return { ok: true };
}
