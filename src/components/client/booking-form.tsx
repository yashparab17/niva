"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { AddToCalendar } from "@/components/client/add-to-calendar";
import { WaitlistButton } from "@/components/client/waitlist-button";
import { Confetti } from "@/components/confetti";
import { Illustration } from "@/components/illustration";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button-variants";
import { Field, FormError, inputClass } from "@/components/ui/field";
import { SlotPicker, type Pick } from "@/components/slot-picker";
import { bookAppointment } from "@/app/actions/client";
import { SLOT_TAKEN } from "@/app/actions/shared";
import { formatDateLong, formatTime } from "@/lib/time";
import { cn } from "@/lib/utils";

type Props = { today: string; startDate: string; startTime?: string; defaultName?: string; defaultPhone?: string };

export function BookingForm({ today, startDate, startTime, defaultName, defaultPhone }: Props) {
  const [pick, setPick] = useState<Pick>({ date: startDate, time: startTime ?? null });
  const [state, action, pending] = useActionState(bookAppointment, {});
  // Bumping this re-fetches slots when the server says the chosen one was taken meanwhile.
  const [version, setVersion] = useState(0);
  // Controlled so React 19's post-action form reset doesn't wipe them after an error.
  const [name, setName] = useState(defaultName ?? "");
  const [phone, setPhone] = useState(defaultPhone ?? "");
  const [seen, setSeen] = useState(state);

  // Each new server response is handled once; a taken slot is dropped and availability re-fetched.
  if (state !== seen) {
    setSeen(state);
    if (state.error === SLOT_TAKEN) {
      setVersion((v) => v + 1);
      setPick((p) => ({ ...p, time: null }));
    }
  }

  if (state.ok && pick.time) {
    return (
      <section className="mx-auto flex max-w-md animate-in flex-col items-center rounded-[2rem] border bg-card p-8 text-center duration-500 zoom-in-95 fade-in">
        <Confetti />
        <Illustration name="success" className="w-56" />
        <h2 className="mt-6 text-3xl font-semibold">You&apos;re Booked!</h2>
        <p className="mt-2 text-muted-foreground">
          {formatDateLong(pick.date)} at {formatTime(pick.time)}
        </p>
        <Link href="/" className={cn(buttonVariants({ size: "xl" }), "mt-8")}>
          See My Appointment
        </Link>
        <AddToCalendar date={pick.date} time={pick.time} className="mt-2" />
      </section>
    );
  }

  return (
    <form action={action} className="grid animate-in fade-in duration-500 grid-cols-[minmax(0,1fr)] gap-10 md:grid-cols-[minmax(0,1fr)_22rem]">
      <SlotPicker
        today={today}
        value={pick}
        onChange={setPick}
        version={version}
        fullDayAction={<WaitlistButton date={pick.date} name={name} phone={phone} />}
      />

      <div className="flex flex-col gap-4 md:sticky md:top-24 md:self-start md:rounded-3xl md:border md:bg-card md:p-6">
        <h2 className="text-xl font-semibold">Your Details</h2>
        <input type="hidden" name="date" value={pick.date} />
        <input type="hidden" name="time" value={pick.time ?? ""} />
        <Field label="Full name">
          <input name="name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" placeholder="Riya Shah" className={inputClass} required />
        </Field>
        <Field label="Phone number">
          <input name="phone" type="tel" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" placeholder="98200 11111" className={inputClass} required />
        </Field>
        <FormError message={state.error} />
        <Button type="submit" size="xl" isDisabled={!pick.time || pending}>
          {pending ? "Booking..." : pick.time ? `Book ${formatTime(pick.time)}` : "Pick a Time to Continue"}
        </Button>
      </div>
    </form>
  );
}
