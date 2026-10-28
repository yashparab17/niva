"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Field, FormError, inputClass } from "@/components/ui/field";
import { findMyAppointments } from "@/app/actions/client";

// Lets a returning client see their bookings with just a phone number (no login in this version).
export function FindForm() {
  const [state, action, pending] = useActionState(findMyAppointments, {});

  return (
    <form action={action} className="flex flex-col gap-4">
      <Field label="Phone number">
        <input name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="98200 11111" className={inputClass} required />
      </Field>
      <FormError message={state.error} />
      <Button type="submit" size="xl" isDisabled={pending}>
        {pending ? "Looking..." : "Show My Appointments"}
      </Button>
    </form>
  );
}
