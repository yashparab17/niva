"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { CalendarAdd01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { buildIcs } from "@/lib/calendar";
import { cn } from "@/lib/utils";

// Downloads an .ics file; phones offer to add it to their calendar, with 1-day and 1-hour alerts.
export function AddToCalendar({ date, time, className }: { date: string; time: string; className?: string }) {
  const download = () => {
    const url = URL.createObjectURL(new Blob([buildIcs(date, time)], { type: "text/calendar" }));
    const link = Object.assign(document.createElement("a"), { href: url, download: "niva-consultation.ics" });
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Button variant="ghost" size="lg" className={cn("text-muted-foreground", className)} onPress={download}>
      <HugeiconsIcon icon={CalendarAdd01Icon} size={18} />
      Add to Calendar
    </Button>
  );
}
