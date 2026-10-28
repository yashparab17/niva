import { Suspense } from "react";
import { connection } from "next/server";
import { Skeleton } from "@/components/skeleton";
import { BookingForm } from "@/components/client/booking-form";
import { listForPhone } from "@/lib/appointments";
import { currentPhone } from "@/lib/session";
import { firstBookableDate, nowInClinic } from "@/lib/time";

export default function BookPage() {
  return (
    <div>
      <h1 className="text-4xl font-semibold">Book a Consultation</h1>
      <p className="mt-2 mb-8 text-muted-foreground">Choose a time that suits you. You can change it later.</p>
      <Suspense fallback={<Skeleton className="h-[32rem]" />}>
        <Booking />
      </Suspense>
    </div>
  );
}

// Returning clients get their name and number pre-filled.
async function Booking() {
  await connection(); // opt in to request-time rendering: the date below changes every day
  const phone = await currentPhone();
  const name = phone ? (await listForPhone(phone))[0]?.client_name : undefined;
  return <BookingForm today={nowInClinic().date} startDate={firstBookableDate()} defaultName={name} defaultPhone={phone ?? undefined} />;
}
