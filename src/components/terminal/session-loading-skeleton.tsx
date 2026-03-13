import { Skeleton } from '@components/ui/skeleton';

export function SessionLoadingSkeleton() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="space-y-4 text-center">
        <Skeleton className="mx-auto h-8 w-48" />
        <Skeleton className="mx-auto h-4 w-64" />
      </div>
    </div>
  );
}
