import { Suspense } from "react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button-variants";
import { Illustration } from "@/components/illustration";
import { HomeSkeleton } from "@/components/skeletons";
import { FindForm } from "@/components/client/find-form";
import { NextAppointment } from "@/components/client/next-appointment";
import { AppointmentRow } from "@/components/client/appointment-row";
import { listForPhone, partition } from "@/lib/appointments";
import { currentPhone } from "@/lib/session";
import { nowInClinic } from "@/lib/time";
import { cn } from "@/lib/utils";

export default function HomePage() {
    return (
        <Suspense fallback={<HomeSkeleton />}>
            <Home />
        </Suspense>
    );
}

const greeting = (hour: number) =>
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

async function Home() {
    const phone = await currentPhone();
    if (!phone) return <Welcome />;

    const rows = await listForPhone(phone);
    const { upcoming } = partition(rows);
    const { date: today, time } = nowInClinic();
    const [next, ...later] = upcoming;
    const firstName = rows[0]?.client_name.split(" ")[0];

    return (
        <div className="flex animate-in flex-col gap-8 fade-in duration-500">
            <header>
                <p className="text-sm font-medium text-muted-foreground">
                    {greeting(Number(time.slice(0, 2)))}
                </p>
                <h1 className="text-4xl font-semibold md:text-5xl">
                    {firstName ? `Hello, ${firstName}` : "Welcome Back"}
                </h1>
            </header>

            {next ? (
                <div className="grid gap-6 md:grid-cols-5">
                    <div className="md:col-span-3">
                        <NextAppointment appointment={next} today={today} />
                    </div>
                    <aside className="flex flex-col gap-4 md:col-span-2">
                        {later.length > 0 && (
                            <>
                                <h2 className="text-xl font-semibold">
                                    Also Coming Up
                                </h2>
                                <ul className="flex flex-col gap-3">
                                    {later.slice(0, 2).map((a) => (
                                        <AppointmentRow
                                            key={a.id}
                                            appointment={a}
                                            today={today}
                                            upcoming
                                        />
                                    ))}
                                </ul>
                            </>
                        )}
                        <Link
                            href="/appointments"
                            className="text-sm font-medium text-primary underline-offset-4 hover:underline"
                        >
                            See All Appointments
                        </Link>
                    </aside>
                </div>
            ) : (
                <section className="flex flex-col items-center gap-8 rounded-[2rem] bg-secondary p-8 md:flex-row md:justify-between md:p-12">
                    <div>
                        <h2 className="text-3xl font-semibold">
                            Nothing Booked Yet
                        </h2>
                        <p className="mt-2 max-w-md text-muted-foreground">
                            Pick a time that suits you. It takes less than a
                            minute.
                        </p>
                        <Link
                            href="/book"
                            className={cn(
                                buttonVariants({ size: "xl" }),
                                "mt-6",
                            )}
                        >
                            Book a Consultation
                        </Link>
                    </div>
                    <Illustration name="book" className="w-56 md:w-72" />
                </section>
            )}
        </div>
    );
}

function Welcome() {
    return (
        <div className="grid animate-in items-center gap-10 fade-in duration-500 md:grid-cols-2 md:gap-16 md:py-8">
            <div>
                <h1 className="mt-3 text-5xl leading-[1.05] font-semibold md:text-6xl">
                    Feel good about food,{" "}
                    <span className="rounded-full bg-secondary px-3">
                        one chat
                    </span>{" "}
                    at a time.
                </h1>
                <p className="mt-5 max-w-md text-lg text-muted-foreground">
                    Book a time that works for you, and change it anytime.
                    We&apos;ll keep your next appointment right here.
                </p>
                <Link
                    href="/book"
                    className={cn(buttonVariants({ size: "xl" }), "mt-8")}
                >
                    Book a Consultation
                </Link>
            </div>
            <div className="flex flex-col gap-6">
                <Illustration
                    name="welcome"
                    className="mx-auto w-full max-w-xs md:max-w-sm"
                />
                <section className="rounded-[2rem] border bg-card p-6 md:p-8">
                    <h2 className="text-2xl font-semibold">Already Booked?</h2>
                    <p className="mt-1 mb-5 text-sm text-muted-foreground">
                        Enter your phone number to see your appointments.
                    </p>
                    <FindForm />
                </section>
            </div>
        </div>
    );
}
