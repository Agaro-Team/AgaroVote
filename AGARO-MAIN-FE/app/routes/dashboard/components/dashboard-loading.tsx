/**
 * Dashboard Loading Skeletons
 *
 * Beautiful loading states for dashboard components
 */
import { Card } from '~/components/ui/card';
import { Skeleton } from '~/components/ui/skeleton';

export function DashboardStatsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-4 rounded" />
          </div>
          <div>
            <Skeleton className="h-8 w-24 mb-2" />
            <Skeleton className="h-3 w-36" />
          </div>
        </Card>
      ))}
    </div>
  );
}

export function ActivePollsListSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-4">
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-2 w-24 rounded-full" />
            <Skeleton className="h-4 w-12" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function MyActivitySkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i}>
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-16" />
          </div>
          {i < 3 && <Skeleton className="h-px w-full my-4" />}
        </div>
      ))}
    </div>
  );
}
