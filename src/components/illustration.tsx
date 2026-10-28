/* eslint-disable @next/next/no-img-element -- static decorative SVGs, nothing for next/image to optimise */
import { cn } from "@/lib/utils";

type Name = "welcome" | "book" | "success" | "empty" | "rest";

// Both variants are in the DOM; CSS shows the one matching the active theme.
export function Illustration({ name, className }: { name: Name; className?: string }) {
  return (
    <>
      <img src={`/illustrations/${name}.svg`} alt="" aria-hidden className={cn("dark:hidden", className)} />
      <img src={`/illustrations/${name}-dark.svg`} alt="" aria-hidden className={cn("hidden dark:block", className)} />
    </>
  );
}
