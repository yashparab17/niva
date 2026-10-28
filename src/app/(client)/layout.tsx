import Link from "next/link";
import { AutoRefresh } from "@/components/auto-refresh";
import { ClientNav } from "@/components/client/client-nav";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ClientNav />
      <AutoRefresh />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 pt-6 pb-28 md:px-8 md:pt-10 md:pb-16">
        {children}
        <p className="mt-16 text-center text-xs text-muted-foreground">
          Are you the nutritionist?{" "}
          <Link href="/dashboard" className="font-medium text-primary underline-offset-4 hover:underline">
            Open Your Dashboard
          </Link>
        </p>
      </main>
    </>
  );
}
