import { Skeleton as UiSkeleton } from '@components/ui/skeleton';

function Skeleton(props: React.ComponentProps<typeof UiSkeleton>) {
  return <UiSkeleton {...props} />;
}

export { Skeleton };
