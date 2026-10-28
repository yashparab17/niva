import { AppointmentActions } from "@/components/client/appointment-actions";
import { formatDateLong, formatTime, relativeDay } from "@/lib/time";
import type { Appointment } from "@/lib/status";

export function NextAppointment({ appointment: a, today }: { appointment: Appointment; today: string }) {
  return (
    <section className="relative overflow-hidden rounded-[2rem] bg-hero p-6 text-hero-foreground md:p-10">
      <div className="pointer-events-none absolute -top-20 -right-16 size-64 rounded-full bg-mint/15" />
      <div className="pointer-events-none absolute -right-4 -bottom-24 size-48 rounded-full bg-mint/10" />
      <div className="relative">
        <p className="text-sm font-semibold text-mint">{relativeDay(a.date)} · your next consultation</p>
        <h2 className="mt-3 font-heading text-4xl font-semibold md:text-5xl">{formatDateLong(a.date)}</h2>
        <p className="mt-1 text-xl text-hero-foreground/80">{formatTime(a.time)}</p>
        <div className="mt-8">
          <AppointmentActions appointment={a} today={today} onDark />
        </div>
      </div>
    </section>
  );
}
