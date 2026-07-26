import { Skeleton } from '@/components/ui/skeleton';

export function DocGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <ul
      aria-hidden
      className="grid grid-cols-2 gap-x-5 gap-y-7 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
    >
      {Array.from({ length: count }).map((_, i) => (
        <li key={i}>
          <DocCardSkeleton />
        </li>
      ))}
    </ul>
  );
}

function DocCardSkeleton() {
  return (
    <div>
      <Skeleton className="aspect-[3/4] w-full rounded-lg" />
      <Skeleton className="mt-2.5 h-3.5 w-3/4" />
      <Skeleton className="mt-1.5 h-3 w-1/2" />
    </div>
  );
}
