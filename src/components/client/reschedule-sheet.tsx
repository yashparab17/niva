"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { FormError } from "@/components/ui/field";
import { SlotPicker, type Pick } from "@/components/slot-picker";
import { rescheduleAppointment } from "@/app/actions/client";
import type { Appointment } from "@/lib/status";

type Props = { appointment: Appointment; today: string; isOpen: boolean; onOpenChange: (open: boolean) => void };

export function RescheduleSheet({ appointment, today, isOpen, onOpenChange }: Props) {
  const [pick, setPick] = useState<Pick>({ date: appointment.date < today ? today : appointment.date, time: null });
  const [version, setVersion] = useState(0);
  const [error, setError] = useState<string>();
  const [pending, start] = useTransition();

  const save = () =>
    start(async () => {
      if (!pick.time) return;
      const result = await rescheduleAppointment(appointment.id, pick.date, pick.time);
      if (!result.error) return onOpenChange(false);
      setError(result.error);
      setPick({ ...pick, time: null });
      setVersion((v) => v + 1);
    });

  return (
    <Sheet title="Pick a New Time" description="Your current slot is released once you confirm." isOpen={isOpen} onOpenChange={onOpenChange}>
      <SlotPicker today={today} value={pick} onChange={setPick} version={version} />
      <FormError message={error} />
      <Button size="xl" isDisabled={!pick.time || pending} onPress={save}>
        {pending ? "Saving..." : "Confirm New Time"}
      </Button>
    </Sheet>
  );
}
