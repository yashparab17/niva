import type { Metadata } from "next";
import Link from "next/link";
import { AutoRefresh } from "@/components/auto-refresh";
import { Logo } from "@/components/logo";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";

export const metadata: Metadata = { title: "Dashboard - niva" };

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="border-b bg-card">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-8">
          <Logo />
          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm font-medium text-primary underline-offset-4 hover:underline">
              View Client App
            </Link>
            <AnimatedThemeToggler
              aria-label="Toggle theme"
              className="grid size-10 cursor-pointer place-items-center rounded-full text-muted-foreground transition hover:bg-accent hover:text-foreground [&_svg]:size-5"
            />
          </div>
        </div>
      </header>
      <AutoRefresh />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 md:px-8 md:py-10">{children}</main>
    </>
  );
}
