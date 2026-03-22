import {
  ScrollArea as UiScrollArea,
  ScrollBar as UiScrollBar,
} from '@components/ui/scroll-area';

function ScrollArea(props: React.ComponentProps<typeof UiScrollArea>) {
  return <UiScrollArea {...props} />;
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
