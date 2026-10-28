// A short burst of CSS-only confetti; pieces are laid out from their index so renders stay pure.
const COLORS = ["var(--mint)", "var(--primary)", "var(--booked-foreground)", "var(--noshow-foreground)"];

export function Confetti() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-40 overflow-hidden motion-reduce:hidden">
      {Array.from({ length: 36 }, (_, i) => (
        <span
          key={i}
          className="confetti-piece"
          style={{
            left: `${(i * 37) % 100}%`,
            background: COLORS[i % COLORS.length],
            animationDelay: `${(i % 9) * 70}ms`,
            animationDuration: `${1800 + ((i * 53) % 900)}ms`,
            ["--drift" as string]: `${((i * 29) % 120) - 60}px`,
          }}
        />
      ))}
    </div>
  );
}
