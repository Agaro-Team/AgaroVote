import { Card, CardContent, CardHeader } from '~/components/ui/card';
import { Skeleton } from '~/components/ui/skeleton';

interface RewardSkeletonListProps {
  count?: number;
  showInfoBanner?: boolean;
}

export function RewardSkeletonList({ count = 4, showInfoBanner = false }: RewardSkeletonListProps) {
  return (
    <div className="space-y-4">
      {/* Optional Info banner skeleton */}
      {showInfoBanner && <Skeleton className="w-full h-16 rounded-lg" />}

      {/* Reward cards skeleton */}
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index} className="overflow-hidden">
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Countdown/Time section skeleton */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-28" />
              </div>
              <Skeleton className="w-full h-2 rounded-full" />
              <Skeleton className="h-3 w-40" />
            </div>

            {/* Vote info skeleton */}
            <div className="grid gap-3">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-32" />
              </div>
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20" />
              </div>
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>

            {/* Reward amount skeleton */}
            <Skeleton className="w-full h-24 rounded-lg" />

            {/* Warning/Info banner skeleton */}
            <Skeleton className="w-full h-12 rounded-lg" />

            {/* Action buttons skeleton */}
            <div className="flex gap-2">
              <Skeleton className="h-10 w-28" />
              <Skeleton className="h-10 w-32" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
