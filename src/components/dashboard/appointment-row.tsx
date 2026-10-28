"use client";

import { useOptimistic, useState, useTransition } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowDown01Icon, Delete02Icon, Tick02Icon, WhatsappIcon } from "@hugeicons/core-free-icons";
import { ConfirmButton } from "@/components/confirm-button";
import { removeAppointment, setStatus } from "@/app/actions/dashboard";
import { STATUSES, STATUS_META, formatPhone, type Appointment, type Status } from "@/lib/status";
import { formatDate, formatTime, isPast } from "@/lib/time";
import { cn } from "@/lib/utils";

const cell = "text-sm";

export function AppointmentRow({ appointment: a, today }: { appointment: Appointment; today: string }) {
  const [status, setOptimistic] = useOptimistic(a.status);
  const [error, setError] = useState<string>();
  const [, start] = useTransition();

  const overdue = status === "booked" && isPast(a.date, a.time);
  const canRemind = status === "booked" && !overdue && a.phone;

  const change = (next: Status) =>
    start(async () => {
      setError(undefined);
      setOptimistic(next);
      const result = await setStatus(a.id, next);
      if (result.error) setError(result.error);
    });

  // One-tap WhatsApp reminder: opens a chat with the message pre-written (no API needed).
  const remind = () => {
    const text = `Hi ${a.client_name.split(" ")[0]}, a reminder of your nutrition consultation on ${formatDate(a.date)} at ${formatTime(a.time)}. Please reply YES to confirm, or tell me if you need to reschedule.`;
    return `https://wa.me/91${a.phone}?text=${encodeURIComponent(text)}`;
  };

  return (
    <li className="grid grid-cols-2 items-center gap-x-4 gap-y-2 rounded-2xl border bg-card p-4 md:grid-cols-[1.6fr_1.1fr_1fr_.8fr_9.5rem_6rem] md:gap-y-0 md:rounded-none md:border-0 md:border-b md:px-5 md:py-3.5 md:last:border-b-0">
      <div className="min-w-0">
        <p className="truncate font-semibold">{a.client_name}</p>
        <div className="mt-1 flex flex-wrap gap-1.5 empty:hidden">
          {overdue && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800 dark:bg-amber-400/20 dark:text-amber-200">Needs update</span>}
          {a.confirmed && status === "booked" && !overdue && (
            <span className="inline-flex items-center gap-1 rounded-full bg-done px-2 py-0.5 text-xs font-semibold text-done-foreground">
              <HugeiconsIcon icon={Tick02Icon} size={12} />
              Confirmed
            </span>
          )}
        </div>
      </div>

      <div className="relative justify-self-end md:col-start-5 md:row-start-1 md:w-full md:justify-self-auto">
        <select
          value={status}
          onChange={(e) => change(e.target.value as Status)}
          aria-label={`Status for ${a.client_name}`}
          className={cn(
            "h-9 w-full min-w-32 cursor-pointer appearance-none rounded-full pr-9 pl-4 text-sm font-semibold outline-none focus-visible:ring-3 focus-visible:ring-ring/40",
            STATUS_META[status].className,
          )}
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_META[s].label}
            </option>
          ))}
        </select>
        <HugeiconsIcon icon={ArrowDown01Icon} size={16} className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 opacity-70" />
      </div>

      <p className={cn(cell, "col-span-2 text-muted-foreground md:col-span-1 md:text-foreground")}>
        {a.phone ? (
          <a href={`tel:${a.phone}`} className="hover:underline">
            {formatPhone(a.phone)}
          </a>
        ) : (
          <span className="opacity-60">No phone</span>
        )}
      </p>
      <p className={cn(cell, "font-medium")}>
        {formatDate(a.date)}
        {a.date === today && <span className="ml-2 rounded-full bg-accent px-2 py-0.5 text-xs text-accent-foreground">Today</span>}
      </p>
      <p className={cn(cell, "justify-self-end text-muted-foreground md:justify-self-auto md:text-foreground")}>{formatTime(a.time)}</p>

      <div className="col-span-2 flex items-center justify-end gap-1 md:col-span-1">
        {canRemind && (
          <a
            href={remind()}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Send ${a.client_name} a WhatsApp reminder`}
            title="Send WhatsApp reminder"
            className="grid size-9 place-items-center rounded-full text-done-foreground transition hover:bg-done"
          >
            <HugeiconsIcon icon={WhatsappIcon} size={20} />
          </a>
        )}
        <ConfirmButton
          title="Remove This Appointment?"
          description={`${a.client_name} on ${formatDate(a.date)} at ${formatTime(a.time)} will be deleted.`}
          confirmLabel="Remove"
          ariaLabel={`Remove ${a.client_name}'s appointment`}
          className="size-9 rounded-full p-0 text-muted-foreground hover:text-destructive"
          onConfirm={() => removeAppointment(a.id)}
        >
          <HugeiconsIcon icon={Delete02Icon} size={18} />
        </ConfirmButton>
      </div>
      {error && (
        <p role="alert" className="col-span-2 text-xs text-noshow-foreground md:col-span-6">
          {error}
        </p>
      )}
    </li>
  );
}
