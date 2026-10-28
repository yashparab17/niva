"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { supabase } from "@/lib/supabase";
import { CANCEL_REASONS, isValidPhone, normalizePhone } from "@/lib/status";
import { PHONE_COOKIE, currentPhone } from "@/lib/session";
import { SLOT_TAKEN, field, isSlotClash, validateSlot, type Result } from "./shared";

async function remember(phone: string) {
  (await cookies()).set(PHONE_COOKIE, phone, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  });
}

const refresh = () => revalidatePath("/", "layout");

export async function findMyAppointments(_: Result, formData: FormData): Promise<Result> {
  const phone = normalizePhone(field(formData, "phone"));
  if (!isValidPhone(phone)) return { error: "Enter your 10-digit phone number." };
  await remember(phone);
  refresh();
  return { ok: true };
}

export async function forgetMe() {
  (await cookies()).delete(PHONE_COOKIE);
  refresh();
}

export async function bookAppointment(_: Result, formData: FormData): Promise<Result> {
  const name = field(formData, "name");
  const phone = normalizePhone(field(formData, "phone"));
  const date = field(formData, "date");
  const time = field(formData, "time");

  if (!name) return { error: "Please tell us your name." };
  if (!isValidPhone(phone)) return { error: "Enter a valid 10-digit phone number." };
  const slotError = validateSlot(date, time);
  if (slotError) return { error: slotError };

  const { error } = await supabase
    .from("appointments")
    .insert({ client_name: name, phone, date, time });
  if (isSlotClash(error)) return { error: SLOT_TAKEN };
  if (error) throw error;

  // They got a slot, so they no longer need to wait for this day.
  await supabase.from("waitlist").delete().eq("phone", phone).eq("date", date);
  await remember(phone);
  refresh();
  return { ok: true };
}

export async function joinWaitlist(name: string, rawPhone: string, date: string): Promise<Result> {
  const phone = normalizePhone(rawPhone);
  if (!name.trim()) return { error: "Please tell us your name first." };
  if (!isValidPhone(phone)) return { error: "Enter a valid 10-digit phone number first." };
  if (validateSlot(date, "09:00") === "Please pick a date and time.") return { error: "Please pick a day." };

  const { error } = await supabase
    .from("waitlist")
    .upsert({ client_name: name.trim(), phone, date }, { onConflict: "phone,date", ignoreDuplicates: true });
  if (error) throw error;

  await remember(phone);
  refresh();
  return { ok: true };
}

// Every change below is scoped to the caller's phone so clients can only touch their own bookings.
export async function rescheduleAppointment(id: string, date: string, time: string): Promise<Result> {
  const phone = await currentPhone();
  const slotError = validateSlot(date, time);
  if (!phone || slotError) return { error: slotError ?? "Please find your appointments first." };

  const { data, error } = await supabase
    .from("appointments")
    .update({ date, time, confirmed: false, running_late: false })
    .eq("id", id)
    .eq("phone", phone)
    .eq("status", "booked")
    .select("id");
  if (isSlotClash(error)) return { error: SLOT_TAKEN };
  if (error) throw error;
  if (!data?.length) return { error: "We couldn't find that appointment." };

  refresh();
  return { ok: true };
}

export async function cancelAppointment(id: string, reason?: string): Promise<Result> {
  const phone = await currentPhone();
  if (!phone) return { error: "Please find your appointments first." };

  const { data, error } = await supabase
    .from("appointments")
    .delete()
    .eq("id", id)
    .eq("phone", phone)
    .eq("status", "booked")
    .select("client_name, phone, date, time");
  if (error) throw error;

  // Keep a record (with the optional reason) so the nutritionist can see why slots opened up.
  if (data?.[0]) {
    const cleanReason = CANCEL_REASONS.includes(reason ?? "") ? reason : null;
    await supabase.from("cancellations").insert({ ...data[0], reason: cleanReason });
  }

  refresh();
  return { ok: true };
}

export async function setRunningLate(id: string, late: boolean): Promise<Result> {
  const phone = await currentPhone();
  if (!phone) return { error: "Please find your appointments first." };

  const { error } = await supabase
    .from("appointments")
    .update({ running_late: late })
    .eq("id", id)
    .eq("phone", phone)
    .eq("status", "booked");
  if (error) throw error;

  refresh();
  return { ok: true };
}

export async function confirmAppointment(id: string): Promise<Result> {
  const phone = await currentPhone();
  if (!phone) return { error: "Please find your appointments first." };

  const { error } = await supabase
    .from("appointments")
    .update({ confirmed: true })
    .eq("id", id)
    .eq("phone", phone)
    .eq("status", "booked");
  if (error) throw error;

  refresh();
  return { ok: true };
}
