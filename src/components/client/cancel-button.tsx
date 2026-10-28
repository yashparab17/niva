"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { FormError } from "@/components/ui/field";
import { cancelAppointment } from "@/app/actions/client";
import { CANCEL_REASONS } from "@/lib/status";

// Cancelling asks for an optional reason so the nutritionist knows why the slot opened up.
export function CancelButton({ id, className }: { id: string; className?: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<string>();
  const [error, setError] = useState<string>();
  const [pending, start] = useTransition();

  const run = () =>
    start(async () => {
      const result = await cancelAppointment(id, reason);
      if (result.error) return setError(result.error);
      setOpen(false);
    });

  return (
    <>
      <Button variant="ghost" className={className} onPress={() => setOpen(true)}>
        Cancel
      </Button>
      <Sheet title="Cancel This Appointment?" description="We'll free up the slot for someone else. You can always book again." isOpen={open} onOpenChange={setOpen}>
        <fieldset>
          <legend className="mb-2 text-sm font-medium">
            Reason <span className="font-normal text-muted-foreground">(optional)</span>
          </legend>
          <div className="flex flex-wrap gap-2">
            {CANCEL_REASONS.map((r) => (
              <button
                key={r}
                type="button"
                aria-pressed={reason === r}
                onClick={() => setReason(reason === r ? undefined : r)}
                className="cursor-pointer rounded-full border border-input px-4 py-2 text-sm transition hover:bg-accent aria-pressed:border-primary aria-pressed:bg-primary aria-pressed:text-primary-foreground"
              >
                {r}
              </button>
            ))}
          </div>
        </fieldset>
        <FormError message={error} />
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="outline" size="lg" onPress={() => setOpen(false)}>
            Keep It
          </Button>
          <Button variant="destructive" size="lg" isDisabled={pending} onPress={run}>
            {pending ? "Working..." : "Yes, Cancel It"}
          </Button>
        </div>
      </Sheet>
    </>
  );
}
