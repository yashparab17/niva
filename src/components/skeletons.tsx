import { cn } from "@/lib/utils";

// Placeholder blocks shaped like each page, so content doesn't jump when it streams in.
function Bone({ className }: { className?: string }) {
  return <div aria-hidden className={cn("animate-pulse rounded-2xl bg-muted", className)} />;
}

export function HomeSkeleton() {
  return (
    <div aria-busy className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <Bone className="h-4 w-28" />
        <Bone className="h-12 w-56" />
      </div>
      <div className="grid gap-6 md:grid-cols-5">
        <Bone className="h-72 rounded-[2rem] md:col-span-3" />
        <div className="flex flex-col gap-3 md:col-span-2">
          <Bone className="h-6 w-40" />
          <Bone className="h-28 rounded-3xl" />
        </div>
      </div>
    </div>
  );
}

export function AppointmentsSkeleton() {
  return (
    <div aria-busy className="flex flex-col gap-6">
      <Bone className="h-11 w-60 rounded-full" />
      <div className="flex flex-col gap-3">
        {[0, 1, 2].map((i) => (
          <Bone key={i} className="h-36 rounded-3xl" />
        ))}
      </div>
    </div>
  );
}

export function BookSkeleton() {
  return (
    <div aria-busy className="grid grid-cols-[minmax(0,1fr)] gap-10 md:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="flex flex-col gap-6">
        <Bone className="h-9 w-full" />
        <div className="grid grid-cols-7 gap-1.5">
          {Array.from({ length: 7 }, (_, i) => (
            <Bone key={i} className="h-16 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {Array.from({ length: 8 }, (_, i) => (
            <Bone key={i} className="h-11" />
          ))}
        </div>
      </div>
      <Bone className="h-80 rounded-3xl" />
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div aria-busy className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <Bone className="h-4 w-40" />
        <Bone className="h-10 w-64" />
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <Bone key={i} className="h-24" />
        ))}
      </div>
      <div className="flex flex-col gap-3">
        {[0, 1, 2, 3, 4].map((i) => (
          <Bone key={i} className="h-16" />
        ))}
      </div>
    </div>
  );
}
