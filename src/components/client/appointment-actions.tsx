"use client";

import { useState, useTransition } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Tick02Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { ConfirmButton } from "@/components/confirm-button";
import { RescheduleSheet } from "@/components/client/reschedule-sheet";
import { cancelAppointment, confirmAppointment } from "@/app/actions/client";
import type { Appointment } from "@/lib/status";
import { cn } from "@/lib/utils";

type Props = { appointment: Appointment; today: string; onDark?: boolean };

// Confirm / reschedule / cancel for one upcoming appointment.
export function AppointmentActions({ appointment, today, onDark }: Props) {
  const [rescheduling, setRescheduling] = useState(false);
  const [pending, start] = useTransition();
  const quiet = onDark ? "text-white hover:bg-white/10 hover:text-white" : "";

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
      <Button
        size="lg"
        variant="outline"
        className={onDark ? "border-white/25 bg-transparent text-white hover:bg-white/10 hover:text-white" : ""}
        onPress={() => setRescheduling(true)}
      >
        Reschedule
      </Button>
      <ConfirmButton
        title="Cancel This Appointment?"
        description="We'll free up the slot for someone else. You can always book again."
        confirmLabel="Yes, Cancel It"
        className={cn("h-11 rounded-xl px-3", quiet)}
        onConfirm={() => cancelAppointment(appointment.id)}
      >
        Cancel
      </ConfirmButton>
      <RescheduleSheet appointment={appointment} today={today} isOpen={rescheduling} onOpenChange={setRescheduling} />
    </div>
  );
}
