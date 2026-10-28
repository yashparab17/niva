"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { FormError } from "@/components/ui/field";
import type { Result } from "@/app/actions/shared";

type Props = {
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => Promise<Result>;
  className?: string;
  ariaLabel?: string;
  children: React.ReactNode;
};

// A button that asks "are you sure?" in a sheet before running a destructive action.
export function ConfirmButton({ title, description, confirmLabel, onConfirm, className, ariaLabel, children }: Props) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string>();
  const [pending, start] = useTransition();

  const run = () =>
    start(async () => {
      const result = await onConfirm();
      if (result.error) return setError(result.error);
      setOpen(false);
    });

  return (
    <>
      <Button variant="ghost" aria-label={ariaLabel} className={className} onPress={() => setOpen(true)}>
        {children}
      </Button>
      <Sheet title={title} description={description} isOpen={open} onOpenChange={setOpen}>
        <FormError message={error} />
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="outline" size="lg" onPress={() => setOpen(false)}>
            Keep It
          </Button>
          <Button variant="destructive" size="lg" isDisabled={pending} onPress={run}>
            {pending ? "Working..." : confirmLabel}
          </Button>
        </div>
      </Sheet>
    </>
  );
}
