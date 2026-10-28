"use client";

import { useState, useTransition } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Tick02Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { AddToCalendar } from "@/components/client/add-to-calendar";
import { CancelButton } from "@/components/client/cancel-button";
import { RescheduleSheet } from "@/components/client/reschedule-sheet";
import { confirmAppointment, setRunningLate } from "@/app/actions/client";
import type { Appointment } from "@/lib/status";
import { cn } from "@/lib/utils";

type Props = { appointment: Appointment; today: string; onDark?: boolean };

// Confirm / running late / reschedule / cancel / add to calendar for one upcoming appointment.
export function AppointmentActions({ appointment, today, onDark }: Props) {
  const [rescheduling, setRescheduling] = useState(false);
  const [pending, start] = useTransition();
  const quiet = onDark ? "text-white hover:bg-white/10 hover:text-white" : "";
  const outline = onDark ? "border-white/25 bg-transparent text-white hover:bg-white/10 hover:text-white" : "";

  return (
    <div className="flex flex-wrap items-center gap-2">
      {appointment.confirmed ? (
        <span className={cn("inline-flex h-11 items-center gap-1.5 px-2 text-sm font-semibold", onDark ? "text-mint" : "text-done-foreground")}>
          <HugeiconsIcon icon={Tick02Icon} size={18} />
          You&apos;re Confirmed
        </span>
      ) : (
        <Button
          size="lg"
          isDisabled={pending}
          className={onDark ? "bg-mint text-hero hover:bg-mint/90" : ""}
          onPress={() => start(async () => void (await confirmAppointment(appointment.id)))}
        >
          I&apos;ll Be There
        </Button>
      )}
      {appointment.date === today && (
        <Button
          size="lg"
          variant="outline"
          isDisabled={pending}
          className={outline}
          onPress={() => start(async () => void (await setRunningLate(appointment.id, !appointment.running_late)))}
        >
          {appointment.running_late ? "Running Late (Sent)" : "Running Late"}
        </Button>
      )}
      <Button size="lg" variant="outline" className={outline} onPress={() => setRescheduling(true)}>
        Reschedule
      </Button>
      <CancelButton id={appointment.id} className={cn("h-11 rounded-xl px-3", quiet)} />
      <AddToCalendar date={appointment.date} time={appointment.time} className={cn("px-3", quiet)} />
      <RescheduleSheet appointment={appointment} today={today} isOpen={rescheduling} onOpenChange={setRescheduling} />
    </div>
  );
}
