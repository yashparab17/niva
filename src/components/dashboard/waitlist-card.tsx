"use client";

import { useTransition } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon, WhatsappIcon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { removeWaitlistEntry } from "@/app/actions/dashboard";
import { formatDate } from "@/lib/time";
import { formatPhone, type WaitlistEntry } from "@/lib/status";
import { cn } from "@/lib/utils";

type Props = { entries: WaitlistEntry[]; openDates: string[] };

// Clients waiting for a day to free up; a one-tap WhatsApp message lets her fill a cancelled slot.
export function WaitlistCard({ entries, openDates }: Props) {
  const [pending, start] = useTransition();

  return (
    <section className="rounded-3xl border bg-card p-5">
      <h2 className="text-xl font-semibold">Waitlist</h2>
      <ul className="mt-3 flex flex-col gap-1">
        {entries.map((e) => {
          const open = openDates.includes(e.date);
          const text = `Hi ${e.client_name.split(" ")[0]}, a slot has opened up on ${formatDate(e.date)}. Reply here and I'll book you in.`;
          return (
            <li key={e.id} className="flex items-center gap-3 py-2">
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{e.client_name}</p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(e.date)} · {formatPhone(e.phone)}
                </p>
              </div>
              <span
                className={cn(
                  "shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold",
                  open ? "bg-done text-done-foreground" : "bg-muted text-muted-foreground",
                )}
              >
                {open ? "Slot Open" : "Full"}
              </span>
              {open && (
                <a
                  href={`https://wa.me/91${e.phone}?text=${encodeURIComponent(text)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Message ${e.client_name} on WhatsApp`}
                  className="grid size-9 shrink-0 place-items-center rounded-full text-done-foreground transition hover:bg-done"
                >
                  <HugeiconsIcon icon={WhatsappIcon} size={20} />
                </a>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 rounded-full text-muted-foreground"
                aria-label={`Remove ${e.client_name} from the waitlist`}
                isDisabled={pending}
                onPress={() => start(async () => void (await removeWaitlistEntry(e.id)))}
              >
                <HugeiconsIcon icon={Cancel01Icon} size={18} />
              </Button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
