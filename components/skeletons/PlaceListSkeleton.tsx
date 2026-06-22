import { PlaceCardSkeleton } from "@/components/skeletons/PlaceCardSkeleton";
import { Skeleton } from "@/components/ui/skeleton";

interface PlaceListSkeletonProps {
  count?: number;
  showTitle?: boolean;
}

export function PlaceListSkeleton({
  count = 4,
  showTitle = true,
}: PlaceListSkeletonProps) {
  return (
    <section aria-busy="true" aria-label="Loading places">
      {showTitle && <Skeleton className="mb-2 h-4 w-44" />}
      <ul className="flex flex-col gap-2">
        {Array.from({ length: count }, (_, index) => (
          <li key={index}>
            <PlaceCardSkeleton />
          </li>
        ))}
      </ul>
    </section>
  );
}
