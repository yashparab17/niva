import { Suspense } from "react";
import { connection } from "next/server";
import { BookSkeleton } from "@/components/skeletons";
import { BookingForm } from "@/components/client/booking-form";
import { listForPhone } from "@/lib/appointments";
import { currentPhone } from "@/lib/session";
import { SLOTS, daysBetween, firstBookableDate, nowInClinic } from "@/lib/time";

export default function BookPage({ searchParams }: PageProps<"/book">) {
  return (
    <div>
      <h1 className="text-4xl font-semibold">Book a Consultation</h1>
      <p className="mt-2 mb-8 text-muted-foreground">Choose a time that suits you. You can change it later.</p>
      <Suspense fallback={<BookSkeleton />}>
        <Booking searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

// Returning clients get their name and number pre-filled.
async function Booking({ searchParams }: { searchParams: PageProps<"/book">["searchParams"] }) {
  await connection(); // opt in to request-time rendering: the date below changes every day
  const phone = await currentPhone();
  const name = phone ? (await listForPhone(phone))[0]?.client_name : undefined;
  const today = nowInClinic().date;

  // "Book again" links arrive as ?date=&time=; ignore anything outside the bookable window.
  const { date, time } = await searchParams;
  const wanted = typeof date === "string" && typeof time === "string" && SLOTS.includes(time) && /^\d{4}-\d{2}-\d{2}$/.test(date);
  const prefill = wanted && daysBetween(today, date) >= 0 && daysBetween(today, date) < 21 ? { date, time } : undefined;

  return (
    <BookingForm
      today={today}
      startDate={prefill?.date ?? firstBookableDate()}
      startTime={prefill?.time}
      defaultName={name}
      defaultPhone={phone ?? undefined}
    />
  );
}
