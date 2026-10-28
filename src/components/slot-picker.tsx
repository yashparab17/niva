"use client";

import { useEffect, useId, useRef, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { addDays, dayOfMonth, daysBetween, formatTime, monthRange, weekday } from "@/lib/time";
import { Button } from "@/components/ui/button";
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
  // Shown when the chosen day is fully booked (the booking form offers the waitlist here).
  fullDayAction?: React.ReactNode;
};

const chip =
  "relative cursor-pointer rounded-2xl border border-input bg-card text-center transition has-checked:border-primary has-checked:bg-primary has-checked:text-primary-foreground has-focus-visible:ring-3 has-focus-visible:ring-ring/40 has-disabled:cursor-not-allowed has-disabled:opacity-40 not-has-checked:not-has-disabled:hover:bg-accent";

const dayOfWeek = (date: string) => new Date(`${date}T00:00:00Z`).getUTCDay();

export function SlotPicker({ today, value, onChange, version = 0, days = 21, fullDayAction }: Props) {
  const id = useId();
  const [loaded, setLoaded] = useState<{ key: string; slots: Slot[] }>();
  const key = `${value.date}:${version}`;

  // The picker pages through Monday-to-Sunday weeks, so seven chips always fit any screen width.
  const firstWeekStart = addDays(today, -((dayOfWeek(today) + 6) % 7));
  const lastDate = addDays(today, days - 1);
  const lastWeek = Math.floor(daysBetween(firstWeekStart, lastDate) / 7);
  const [week, setWeek] = useState(Math.max(0, Math.floor(daysBetween(firstWeekStart, value.date) / 7)));
  const swipeStart = useRef<number | null>(null);
  const weekDates = Array.from({ length: 7 }, (_, i) => addDays(firstWeekStart, week * 7 + i));

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/slots?date=${value.date}`, { cache: "no-store", signal: controller.signal })
      .then((res) => res.json())
      .then((slots: Slot[]) => setLoaded({ key, slots }))
      .catch(() => {}); // aborted when the date changes; the next request takes over
    return () => controller.abort();
  }, [value.date, key]);

  const slots = loaded?.key === key ? loaded.slots : null;
  const groups = slots && [
    { label: "Morning", items: slots.filter((s) => s.time < "12:00") },
    { label: "Afternoon", items: slots.filter((s) => s.time >= "12:00") },
  ];

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <fieldset className="min-w-0">
        <legend className="sr-only">Pick a Day</legend>
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-medium" aria-live="polite">
            {monthRange(weekDates[0], weekDates[6])}
          </p>
          <div className="flex gap-1">
            <Button variant="outline" size="icon" className="rounded-full" aria-label="Previous week" isDisabled={week === 0} onPress={() => setWeek(week - 1)}>
              <HugeiconsIcon icon={ArrowLeft01Icon} size={18} />
            </Button>
            <Button variant="outline" size="icon" className="rounded-full" aria-label="Next week" isDisabled={week >= lastWeek} onPress={() => setWeek(week + 1)}>
              <HugeiconsIcon icon={ArrowRight01Icon} size={18} />
            </Button>
          </div>
        </div>
        {/* key remounts the row so each week change fades in */}
        <div
          key={week}
          // Swipe left or right to change week.
          onTouchStart={(e) => (swipeStart.current = e.touches[0].clientX)}
          onTouchEnd={(e) => {
            const dx = e.changedTouches[0].clientX - (swipeStart.current ?? e.changedTouches[0].clientX);
            if (Math.abs(dx) > 50) setWeek((w) => Math.min(lastWeek, Math.max(0, w + (dx < 0 ? 1 : -1))));
          }}
          className="grid animate-in grid-cols-7 gap-1.5 fade-in duration-200 sm:gap-2">
          {weekDates.map((date) => (
            <label key={date} className={cn(chip, "flex min-w-0 flex-col items-center gap-0.5 rounded-xl py-2.5 sm:rounded-2xl sm:py-3")}>
              <input
                type="radio"
                name={`${id}-date`}
                className="sr-only"
                disabled={date < today || date > lastDate}
                checked={value.date === date}
                onChange={() => onChange({ date, time: null })}
              />
              <span className="text-[11px] opacity-70 sm:text-xs">{weekday(date)}</span>
              <span className="font-heading text-lg font-semibold sm:text-xl">{dayOfMonth(date)}</span>
              <span aria-hidden className={cn("size-1 rounded-full", date === today ? "bg-current" : "bg-transparent")} />
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="min-w-0">
        <legend className="mb-3 text-sm font-medium">Pick a Time</legend>
        {!groups ? (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4" aria-busy>
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="h-11 animate-pulse rounded-2xl bg-muted" />
            ))}
          </div>
        ) : slots.some((s) => s.free) ? (
          <div className="flex animate-in flex-col gap-4 fade-in duration-300">
            {groups.map(({ label, items }) => (
              <div key={label}>
                <p className="mb-2 text-xs font-medium text-muted-foreground">{label}</p>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {items.map(({ time, free }) => (
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
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 rounded-2xl bg-muted px-4 py-6 text-center text-sm text-muted-foreground">
            No times left on this day. Try another one.
            {fullDayAction}
          </div>
        )}
      </fieldset>
    </div>
  );
}
