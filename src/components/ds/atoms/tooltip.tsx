import {
  Tooltip as UiTooltip,
  TooltipContent as UiTooltipContent,
  TooltipProvider as UiTooltipProvider,
  TooltipTrigger as UiTooltipTrigger,
} from '@components/ui/tooltip';

function TooltipProvider({
  delay,
  ...props
}: React.ComponentProps<typeof UiTooltipProvider> & {
  delay?: number;
}) {
  return (
    <UiTooltipProvider
      delay={delay}
      {...props}
    />
  );
}

function Tooltip(props: React.ComponentProps<typeof UiTooltip>) {
  return <UiTooltip {...props} />;
}

function TooltipTrigger(props: React.ComponentProps<typeof UiTooltipTrigger>) {
  return <UiTooltipTrigger {...props} />;
}

function TooltipContent({
  side,
  sideOffset,
  align,
  alignOffset,
  ...props
}: React.ComponentProps<typeof UiTooltipContent>) {
  return (
    <UiTooltipContent
      side={side}
      sideOffset={sideOffset}
      align={align}
      alignOffset={alignOffset}
      {...props}
    />
  );
}

export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger };
