"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { Calendar03Icon, CalendarAdd01Icon, Home01Icon } from "@hugeicons/core-free-icons";
import { Logo } from "@/components/logo";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/", label: "Home", icon: Home01Icon },
  { href: "/book", label: "Book", icon: CalendarAdd01Icon },
  { href: "/appointments", label: "My Appointments", short: "Appointments", icon: Calendar03Icon },
];

// Top bar on desktop, thumb-friendly tab bar on phones.
export function ClientNav() {
  const pathname = usePathname();

  return (
    <>
      <header className="sticky top-0 z-30 border-b bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 md:px-8">
          <Link href="/" aria-label="niva home">
            <Logo />
          </Link>
          <div className="flex items-center gap-1">
          <nav className="hidden items-center gap-1 md:flex">
            {LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                aria-current={pathname === href ? "page" : undefined}
                className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition hover:text-foreground aria-[current=page]:bg-accent aria-[current=page]:text-accent-foreground"
              >
                {label}
              </Link>
            ))}
            <Link href="/book" className={cn(buttonVariants({ size: "lg" }), "ml-3")}>
              Book a Consultation
            </Link>
          </nav>
          <AnimatedThemeToggler
              aria-label="Toggle theme"
              className="grid size-10 cursor-pointer place-items-center rounded-full text-muted-foreground transition hover:bg-accent hover:text-foreground [&_svg]:size-5"
            />
          </div>
        </div>
      </header>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
        <ul className="mx-auto grid h-16 max-w-md grid-cols-3">
          {LINKS.map(({ href, label, short, icon }) => (
            <li key={href}>
              <Link
                href={href}
                aria-current={pathname === href ? "page" : undefined}
                className="flex h-full flex-col items-center justify-center gap-1 text-xs font-medium text-muted-foreground aria-[current=page]:text-primary"
              >
                <HugeiconsIcon icon={icon} size={22} />
                {short ?? label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
