import { PlaceCardSkeleton } from "@/components/skeletons/PlaceCardSkeleton";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function GroupDetailSkeleton() {
  return (
    <div className="mx-auto max-w-2xl p-6" aria-busy="true" aria-label="Loading group">
      <Skeleton className="mb-6 h-8 w-48" />

      <Card className="mb-6 p-4">
        <Skeleton className="mb-3 h-4 w-32" />
        <div className="flex flex-col gap-2">
          {Array.from({ length: 3 }, (_, index) => (
            <Skeleton key={index} className="h-10 w-full" />
          ))}
        </div>
      </Card>

      <Skeleton className="mb-2 h-4 w-40" />
      <ul className="mb-6 flex flex-col gap-2">
        {Array.from({ length: 2 }, (_, index) => (
          <li key={index}>
            <PlaceCardSkeleton />
          </li>
        ))}
      </ul>

      <Skeleton className="mb-2 h-4 w-36" />
      <ul className="flex flex-col gap-2">
        {Array.from({ length: 2 }, (_, index) => (
          <li key={index}>
            <PlaceCardSkeleton />
          </li>
        ))}
      </ul>
    </div>
  );
}
