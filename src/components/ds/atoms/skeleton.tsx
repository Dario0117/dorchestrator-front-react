import { Skeleton as UiSkeleton } from '@components/ui/skeleton';
import { cn } from '@lib/utils';

type UiSkeletonProps = React.ComponentProps<typeof UiSkeleton>;

interface SkeletonProps extends Omit<UiSkeletonProps, 'className' | 'style'> {
  w?: string;
  h?: string;
  rounded?: boolean;
  centered?: boolean;
  spaceBelow?: 'lg';
  spaceAbove?: 'md';
}

function Skeleton({
  w,
  h,
  rounded,
  centered,
  spaceBelow,
  spaceAbove,
  ...props
}: SkeletonProps) {
  return (
    <UiSkeleton
      className={cn(
        rounded && 'rounded-md',
        centered && 'mx-auto',
        spaceBelow === 'lg' && 'mb-6',
        spaceAbove === 'md' && 'mt-4',
      )}
      style={{
        ...(w ? { width: w } : {}),
        ...(h ? { height: h } : {}),
      }}
      {...props}
    />
  );
}

export { Skeleton };
