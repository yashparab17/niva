import { Suspense } from "react";
import { Skeleton } from "@/components/skeleton";
import { AppointmentTable } from "@/components/dashboard/appointment-table";
import { listAll } from "@/lib/appointments";
import { firstBookableDate, formatDateLong, isPast, nowInClinic } from "@/lib/time";

export default function DashboardPage() {
  return (
    <Suspense fallback={<Skeleton className="h-[32rem]" />}>
      <Dashboard />
    </Suspense>
  );
}

async function Dashboard() {
  const rows = await listAll();
  const today = nowInClinic().date;
  const booked = rows.filter((a) => a.status === "booked");

  const stats = [
    { label: "Today", value: rows.filter((a) => a.date === today).length },
    { label: "Upcoming", value: booked.filter((a) => !isPast(a.date, a.time)).length },
    { label: "Needs an Update", value: booked.filter((a) => isPast(a.date, a.time)).length },
  ];

  return (
    <div className="flex animate-in flex-col gap-8 fade-in duration-500">
      <header>
        <p className="text-sm font-medium text-muted-foreground">{formatDateLong(today)}</p>
        <h1 className="text-4xl font-semibold">Appointments</h1>
      </header>

      <dl className="grid grid-cols-3 gap-3 md:gap-4">
        {stats.map(({ label, value }) => (
          <div key={label} className="rounded-2xl border bg-card p-4 md:p-5">
            <dt className="text-xs font-medium text-muted-foreground md:text-sm">{label}</dt>
            <dd className="mt-1 font-heading text-3xl font-semibold md:text-4xl">{value}</dd>
          </div>
        ))}
      </dl>

      <AppointmentTable rows={rows} today={today} startDate={firstBookableDate()} />
    </div>
  );
}
