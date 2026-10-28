export function Skeleton({ className = "h-64" }: { className?: string }) {
  return <div aria-busy className={`animate-pulse rounded-[2rem] bg-muted ${className}`} />;
}
