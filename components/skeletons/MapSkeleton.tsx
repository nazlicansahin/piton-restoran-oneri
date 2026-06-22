import { Skeleton } from "@/components/ui/skeleton";

export function MapSkeleton() {
  return (
    <div
      className="flex h-full flex-col gap-3 p-4"
      aria-busy="true"
      aria-label="Loading map"
    >
      <Skeleton className="h-full min-h-[200px] w-full rounded-lg" />
      <div className="flex gap-2">
        <Skeleton className="h-8 w-8 rounded-md" />
        <Skeleton className="h-8 w-8 rounded-md" />
      </div>
    </div>
  );
}
