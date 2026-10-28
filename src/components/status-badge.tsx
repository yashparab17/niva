import { STATUS_META, type Status } from "@/lib/status";
import { cn } from "@/lib/utils";

export function StatusBadge({ status, label, className }: { status: Status; label?: string; className?: string }) {
  const { label: defaultLabel, className: colour } = STATUS_META[status];
  return (
    <span className={cn("inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold", colour, className)}>
      {label ?? defaultLabel}
    </span>
  );
}
