import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function GroupListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <ul className="flex flex-col gap-2" aria-busy="true" aria-label="Loading groups">
      {Array.from({ length: count }, (_, index) => (
        <li key={index}>
          <Card className="p-4">
            <div className="flex items-center justify-between gap-2">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-5 w-14 rounded-full" />
            </div>
            <Skeleton className="mt-2 h-3 w-full" />
            <Skeleton className="mt-2 h-3 w-20" />
          </Card>
        </li>
      ))}
    </ul>
  );
}
