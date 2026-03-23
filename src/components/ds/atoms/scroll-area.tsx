import {
  ScrollArea as UiScrollArea,
  ScrollBar as UiScrollBar,
} from '@components/ui/scroll-area';
import { cn } from '@lib/utils';

type UiScrollAreaProps = React.ComponentProps<typeof UiScrollArea>;

type ScrollAreaMaxH = '80';
const SCROLL_MAX_H: Record<ScrollAreaMaxH, string> = {
  '80': 'max-h-80',
};

interface ScrollAreaProps
  extends Omit<UiScrollAreaProps, 'className' | 'style'> {
  maxHeight?: ScrollAreaMaxH;
}

function ScrollArea({ maxHeight, ...props }: ScrollAreaProps) {
  return (
    <UiScrollArea
      className={cn(maxHeight && SCROLL_MAX_H[maxHeight])}
      {...props}
    />
  );
}

function ScrollBar({
  orientation,
  ...props
}: React.ComponentProps<typeof UiScrollBar>) {
  return (
    <UiScrollBar
      orientation={orientation}
      {...props}
    />
  );
}

export { ScrollArea, ScrollBar };
