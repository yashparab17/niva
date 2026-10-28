import { Suspense } from "react";
import { DashboardSkeleton } from "@/components/skeletons";
import { AppointmentTable } from "@/components/dashboard/appointment-table";
import { WaitlistCard } from "@/components/dashboard/waitlist-card";
import { listAll, listRecentCancellations, listWaitlist, slotsForDate } from "@/lib/appointments";
import { clientKey } from "@/lib/status";
import { addDays, firstBookableDate, formatDate, formatDateLong, formatTime, isPast, nowInClinic } from "@/lib/time";

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <Dashboard />
    </Suspense>
  );
}

async function Dashboard() {
  const [rows, waitlist, cancellations] = await Promise.all([listAll(), listWaitlist(), listRecentCancellations()]);
  const today = nowInClinic().date;
  const booked = rows.filter((a) => a.status === "booked");

  // Per-client record of finished visits, so repeat no-shows stand out.
  const history: Record<string, { missed: number; total: number }> = {};
  for (const a of rows) {
    if (a.status === "booked") continue;
    const h = (history[clientKey(a)] ??= { missed: 0, total: 0 });
    h.total += 1;
    if (a.status === "no_show") h.missed += 1;
  }

  // No-show rate over the last 30 days.
  const recent = rows.filter((a) => a.status !== "booked" && a.date >= addDays(today, -30));
  const missed = recent.filter((a) => a.status === "no_show").length;

  // Waitlisted days that currently have a free slot, i.e. worth a message.
  const waitDates = [...new Set(waitlist.map((w) => w.date).filter((d) => d >= today))];
  const openDates = (
    await Promise.all(waitDates.map(async (d) => ((await slotsForDate(d)).some((s) => s.free) ? d : null)))
  ).filter((d): d is string => d !== null);

  const stats = [
    { label: "Today", value: String(rows.filter((a) => a.date === today).length), note: undefined },
    { label: "Upcoming", value: String(booked.filter((a) => !isPast(a.date, a.time)).length), note: undefined },
    { label: "Needs an Update", value: String(booked.filter((a) => isPast(a.date, a.time)).length), note: undefined },
    {
      label: "No-show Rate",
      value: recent.length ? `${Math.round((missed / recent.length) * 100)}%` : "-",
      note: recent.length ? `${missed} of ${recent.length} visits, last 30 days` : "No visits yet",
    },
  ];

  return (
    <div className="flex animate-in flex-col gap-8 fade-in duration-500">
      <header>
        <p className="text-sm font-medium text-muted-foreground">{formatDateLong(today)}</p>
        <h1 className="text-4xl font-semibold">Appointments</h1>
      </header>

      <dl className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        {stats.map(({ label, value, note }) => (
          <div key={label} className="rounded-2xl border bg-card p-4 md:p-5">
            <dt className="text-xs font-medium text-muted-foreground md:text-sm">{label}</dt>
            <dd className="mt-1 font-heading text-3xl font-semibold md:text-4xl">{value}</dd>
            {note && <p className="mt-1 text-xs text-muted-foreground">{note}</p>}
          </div>
        ))}
      </dl>

      {(waitlist.length > 0 || cancellations.length > 0) && (
        <div className="grid gap-4 md:grid-cols-2">
          {waitlist.length > 0 && <WaitlistCard entries={waitlist} openDates={openDates} />}
          {cancellations.length > 0 && (
            <section className="rounded-3xl border bg-card p-5">
              <h2 className="text-xl font-semibold">Recent Cancellations</h2>
              <ul className="mt-3 flex flex-col gap-1">
                {cancellations.map((c) => (
                  <li key={c.id} className="py-2">
                    <p className="font-medium">{c.client_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(c.date)} at {formatTime(c.time)} · {c.reason ?? "No reason given"}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}

      <AppointmentTable rows={rows} today={today} startDate={firstBookableDate()} history={history} />
    </div>
  );
}
