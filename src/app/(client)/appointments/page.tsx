import { Suspense } from "react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button-variants";
import { Illustration } from "@/components/illustration";
import { AppointmentsSkeleton } from "@/components/skeletons";
import { FindForm } from "@/components/client/find-form";
import { AppointmentRow } from "@/components/client/appointment-row";
import { AppointmentTabs } from "@/components/client/appointment-tabs";
import { listForPhone, partition } from "@/lib/appointments";
import { currentPhone } from "@/lib/session";
import { nowInClinic } from "@/lib/time";
import { cn } from "@/lib/utils";
import type { Appointment } from "@/lib/status";

export default function AppointmentsPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-4xl font-semibold">My Appointments</h1>
      <Suspense fallback={<AppointmentsSkeleton />}>
        <Appointments />
      </Suspense>
    </div>
  );
}

async function Appointments() {
  const phone = await currentPhone();
  if (!phone) {
    return (
      <section className="rounded-[2rem] border bg-card p-6">
        <p className="mb-5 text-muted-foreground">Enter your phone number to see your appointments.</p>
        <FindForm />
      </section>
    );
  }

  const { upcoming, past } = partition(await listForPhone(phone));
  const today = nowInClinic().date;
  const list = (items: Appointment[], isUpcoming: boolean) => (
    <ul className="flex flex-col gap-3">
      {items.map((a) => (
        <AppointmentRow key={a.id} appointment={a} today={today} upcoming={isUpcoming} />
      ))}
    </ul>
  );

  return (
    <AppointmentTabs
      upcomingCount={upcoming.length}
      pastCount={past.length}
      upcoming={
        upcoming.length ? (
          list(upcoming, true)
        ) : (
          <div className="flex flex-col items-center rounded-3xl bg-secondary p-8 text-center">
            <Illustration name="empty" className="mb-4 w-40" />
            <p className="font-heading text-xl font-semibold">No Upcoming Appointments</p>
            <Link href="/book" className={cn(buttonVariants({ size: "lg" }), "mt-4")}>
              Book a Consultation
            </Link>
          </div>
        )
      }
      past={
        past.length ? (
          list(past, false)
        ) : (
          <div className="flex flex-col items-center py-8 text-center text-muted-foreground">
            <Illustration name="empty" className="mb-4 w-40" />
            No past appointments yet.
          </div>
        )
      }
    />
  );
}
