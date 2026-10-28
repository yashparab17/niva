"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, FormError, inputClass } from "@/components/ui/field";
import { SlotPicker, type Pick } from "@/components/slot-picker";
import { addAppointment } from "@/app/actions/dashboard";
import type { Result } from "@/app/actions/shared";
import { formatTime } from "@/lib/time";

export function AddAppointmentForm({ today, startDate, onDone }: { today: string; startDate: string; onDone: () => void }) {
  const [pick, setPick] = useState<Pick>({ date: startDate, time: null });
  const [version, setVersion] = useState(0);
  // Controlled so React 19's post-action form reset doesn't wipe the fields after an error.
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const submit = async (_: Result, formData: FormData) => {
    const result = await addAppointment(_, formData);
    if (result.ok) onDone();
    else setVersion((v) => v + 1);
    return result;
  };
  const [state, action, pending] = useActionState(submit, {});

  return (
    <form action={action} className="flex flex-col gap-5">
      <Field label="Client name">
        <input name="name" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} placeholder="Riya Shah" required />
      </Field>
      <Field label="Phone" hint="(optional)">
        <input name="phone" type="tel" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} placeholder="98200 11111" />
      </Field>
      <input type="hidden" name="date" value={pick.date} />
      <input type="hidden" name="time" value={pick.time ?? ""} />
      <SlotPicker today={today} value={pick} onChange={setPick} version={version} />
      <FormError message={state.error} />
      <Button type="submit" size="xl" isDisabled={!pick.time || pending}>
        {pending ? "Adding..." : pick.time ? `Add at ${formatTime(pick.time)}` : "Pick a Time"}
      </Button>
    </form>
  );
}
