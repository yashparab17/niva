"use client";

import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { Illustration } from "@/components/illustration";
import { AddAppointmentForm } from "@/components/dashboard/add-appointment-form";
import { AppointmentRow } from "@/components/dashboard/appointment-row";
import { clientKey, type Appointment } from "@/lib/status";
import { cn } from "@/lib/utils";

type Filter = "all" | "today";
const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "today", label: "Today" },
];

export function AppointmentTable({ rows, today, startDate, history }: { rows: Appointment[]; today: string; startDate: string; history: Record<string, { missed: number; total: number }> }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [adding, setAdding] = useState(false);

  // Today onwards first (soonest at the top), then earlier days (most recent first).
  const visible = rows.filter((a) => filter === "all" || a.date === today);
  const ordered = [...visible.filter((a) => a.date >= today), ...visible.filter((a) => a.date < today).reverse()];

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <div role="group" aria-label="Filter appointments" className="inline-flex gap-1 rounded-full bg-muted p-1">
          {FILTERS.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              aria-pressed={filter === id}
              onClick={() => setFilter(id)}
              className={cn(
                "cursor-pointer rounded-full px-5 py-2 text-sm font-medium text-muted-foreground transition aria-pressed:bg-primary aria-pressed:text-primary-foreground",
              )}
            >
              {label}
            </button>
          ))}
        </div>
        <Button size="lg" onPress={() => setAdding(true)}>
          <HugeiconsIcon icon={Add01Icon} size={18} />
          Add Appointment
        </Button>
      </div>

      <div className="overflow-hidden md:rounded-3xl md:border md:bg-card">
        <div className="hidden grid-cols-[1.6fr_1.1fr_1fr_.8fr_9.5rem_6rem] gap-4 border-b bg-muted/60 px-5 py-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase md:grid">
          <span>Client</span>
          <span>Phone</span>
          <span>Date</span>
          <span>Time</span>
          <span>Status</span>
          <span />
        </div>
        {ordered.length ? (
          <ul className="flex flex-col gap-3 md:gap-0">
            {ordered.map((a) => (
              <AppointmentRow key={a.id} appointment={a} today={today} history={history[clientKey(a)]} />
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-center rounded-3xl border bg-card py-12 text-center text-muted-foreground md:border-0">
            <Illustration name="rest" className="mb-4 w-56" />
            {filter === "today" ? "No appointments today. Enjoy the quiet." : "No appointments yet."}
          </div>
        )}
      </div>

      <Sheet title="Add an Appointment" description="For walk-ins and bookings made over WhatsApp or phone." isOpen={adding} onOpenChange={setAdding}>
        <AddAppointmentForm today={today} startDate={startDate} onDone={() => setAdding(false)} />
      </Sheet>
    </section>
  );
}
