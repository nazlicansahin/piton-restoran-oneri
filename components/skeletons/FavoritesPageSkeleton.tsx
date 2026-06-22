import { PlaceCardSkeleton } from "@/components/skeletons/PlaceCardSkeleton";
import { Skeleton } from "@/components/ui/skeleton";

export function FavoritesPageSkeleton() {
  return (
    <div className="mx-auto max-w-2xl p-6" aria-busy="true" aria-label="Loading favorites">
      <Skeleton className="mb-1 h-8 w-40" />
      <Skeleton className="mb-6 h-4 w-28" />
      <div className="flex flex-col gap-6">
        {[2, 3].map((count, groupIndex) => (
          <section key={groupIndex}>
            <div className="mb-2 flex items-baseline justify-between gap-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
            <ul className="flex flex-col gap-2">
              {Array.from({ length: count }, (_, index) => (
                <li key={index}>
                  <PlaceCardSkeleton />
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
