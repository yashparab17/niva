"use client";

import { useEffect, useId, useState } from "react";
import { addDays, dayOfMonth, formatTime, monthShort, weekday } from "@/lib/time";
import { cn } from "@/lib/utils";

type Slot = { time: string; free: boolean };
export type Pick = { date: string; time: string | null };

type Props = {
  today: string;
  value: Pick;
  onChange: (pick: Pick) => void;
  // Bump to re-fetch availability, e.g. after someone else grabbed the slot.
  version?: number;
  days?: number;
};

const chip =
  "cursor-pointer rounded-2xl border border-input bg-card text-center transition has-checked:border-primary has-checked:bg-primary has-checked:text-primary-foreground has-focus-visible:ring-3 has-focus-visible:ring-ring/40 has-disabled:cursor-not-allowed has-disabled:opacity-40 not-has-checked:not-has-disabled:hover:bg-accent";

export function SlotPicker({ today, value, onChange, version = 0, days = 21 }: Props) {
  const id = useId();
  const [loaded, setLoaded] = useState<{ key: string; slots: Slot[] }>();
  const key = `${value.date}:${version}`;

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/slots?date=${value.date}`, { cache: "no-store", signal: controller.signal })
      .then((res) => res.json())
      .then((slots: Slot[]) => setLoaded({ key, slots }))
      .catch(() => {}); // aborted when the date changes; the next request takes over
    return () => controller.abort();
  }, [value.date, key]);

  const slots = loaded?.key === key ? loaded.slots : null;
  const dates = Array.from({ length: days }, (_, i) => addDays(today, i));

  return (
    <div className="flex flex-col gap-6">
      <fieldset className="min-w-0">
        <legend className="mb-3 text-sm font-medium">Pick a Day</legend>
        <div className="-mx-4 flex snap-x gap-2 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-7 md:overflow-visible md:px-0">
          {dates.map((date) => (
            <label key={date} className={cn(chip, "flex w-16 shrink-0 snap-start flex-col gap-0.5 py-3 md:w-auto")}>
              <input
                type="radio"
                name={`${id}-date`}
                className="sr-only"
                checked={value.date === date}
                onChange={() => onChange({ date, time: null })}
              />
              <span className="text-xs opacity-70">{date === today ? "Today" : weekday(date)}</span>
              <span className="font-heading text-xl font-semibold">{dayOfMonth(date)}</span>
              <span className="text-xs opacity-70">{monthShort(date)}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="min-w-0">
        <legend className="mb-3 text-sm font-medium">Pick a Time</legend>
        {!slots ? (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4" aria-busy>
            {Array.from({ length: 8 }, (_, i) => (
              <div key={i} className="h-11 animate-pulse rounded-2xl bg-muted" />
            ))}
          </div>
        ) : slots.some((s) => s.free) ? (
          <div className="grid animate-in grid-cols-3 gap-2 fade-in duration-300 sm:grid-cols-4">
            {slots.map(({ time, free }) => (
              <label key={time} className={cn(chip, "py-3 text-sm font-medium")}>
                <input
                  type="radio"
                  name={`${id}-time`}
                  className="sr-only"
                  disabled={!free}
                  checked={value.time === time}
                  onChange={() => onChange({ date: value.date, time })}
                />
                {formatTime(time)}
              </label>
            ))}
          </div>
        ) : (
          <p className="rounded-2xl bg-muted px-4 py-6 text-center text-sm text-muted-foreground">
            No times left on this day. Try another one.
          </p>
        )}
      </fieldset>
    </div>
  );
}
