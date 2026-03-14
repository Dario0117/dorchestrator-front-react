import { Skeleton } from '@components/ui/skeleton';

export function RecordingPlaybackSkeleton() {
  return (
    <section className="p-6 md:p-10 space-y-6">
      <div className="py-6">
        <Skeleton className="mb-6 h-8 w-32" />
        <Skeleton className="mb-6 h-8 w-64" />
        <Skeleton className="h-[500px] w-full rounded-md" />
        <Skeleton className="mt-4 h-20 w-full rounded-md" />
      </div>
    </section>
  );
}
