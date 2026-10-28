"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { joinWaitlist } from "@/app/actions/client";
import { formatDate } from "@/lib/time";

// On a fully booked day: "tell me if this opens up", using the name and phone already typed in.
export function WaitlistButton({ date, name, phone }: { date: string; name: string; phone: string }) {
  const [message, setMessage] = useState<{ text: string; ok: boolean }>();
  const [pending, start] = useTransition();

  const join = () =>
    start(async () => {
      const result = await joinWaitlist(name, phone, date);
      setMessage(
        result.error
          ? { text: result.error, ok: false }
          : { text: `You're on the list for ${formatDate(date)}. We'll message you if a slot opens.`, ok: true },
      );
    });

  if (message?.ok) return <p className="font-medium text-done-foreground">{message.text}</p>;
  return (
    <>
      <Button variant="outline" size="lg" isDisabled={pending} onPress={join}>
        {pending ? "Adding..." : "Notify Me If This Opens Up"}
      </Button>
      {message && (
        <p role="alert" className="text-noshow-foreground">
          {message.text}
        </p>
      )}
    </>
  );
}
