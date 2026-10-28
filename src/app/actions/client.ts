"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { supabase } from "@/lib/supabase";
import { isValidPhone, normalizePhone } from "@/lib/status";
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
    .update({ date, time, confirmed: false })
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

export async function cancelAppointment(id: string): Promise<Result> {
  const phone = await currentPhone();
  if (!phone) return { error: "Please find your appointments first." };

  const { error } = await supabase
    .from("appointments")
    .delete()
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
