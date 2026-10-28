import { StatusBadge } from "@/components/status-badge";
import { AppointmentActions } from "@/components/client/appointment-actions";
import { dayOfMonth, formatDate, formatTime, monthShort } from "@/lib/time";
import type { Appointment } from "@/lib/status";

type Props = { appointment: Appointment; today: string; upcoming: boolean };

export function AppointmentRow({ appointment: a, today, upcoming }: Props) {
  return (
    <li className="animate-in rounded-3xl border bg-card p-4 transition-shadow fade-in slide-in-from-bottom-1 duration-300 hover:shadow-sm md:p-5">
      <div className="flex items-center gap-4">
        <div className="grid size-16 shrink-0 place-items-center rounded-2xl bg-accent text-center leading-none text-accent-foreground">
          <div>
            <div className="font-heading text-2xl font-semibold">{dayOfMonth(a.date)}</div>
            <div className="mt-1 text-xs uppercase tracking-wide">{monthShort(a.date)}</div>
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold">{formatDate(a.date)}</p>
          <p className="text-sm text-muted-foreground">{formatTime(a.time)} · Nutrition consultation</p>
        </div>
        {!upcoming && a.status !== "booked" && (
          <StatusBadge status={a.status} label={a.status === "no_show" ? "Missed" : undefined} />
        )}
      </div>
      {upcoming && (
        <div className="mt-4 border-t pt-3">
          <AppointmentActions appointment={a} today={today} />
        </div>
      )}
    </li>
  );
}
