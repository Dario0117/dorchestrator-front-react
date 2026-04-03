import {
  Collapsible as ShadcnCollapsible,
  CollapsibleContent as ShadcnCollapsibleContent,
  CollapsibleTrigger as ShadcnCollapsibleTrigger,
} from '@components/ui/collapsible';
import { cn } from '@lib/utils';

type ShadcnCollapsibleProps = React.ComponentProps<typeof ShadcnCollapsible>;
interface CollapsibleProps
  extends Omit<ShadcnCollapsibleProps, 'className' | 'style'> {
  group?: boolean;
}

type ShadcnCollapsibleTriggerProps = React.ComponentProps<
  typeof ShadcnCollapsibleTrigger
>;
interface CollapsibleTriggerProps
  extends Omit<ShadcnCollapsibleTriggerProps, 'className' | 'style'> {
  layout?: 'inline';
}

type ShadcnCollapsibleContentProps = React.ComponentProps<
  typeof ShadcnCollapsibleContent
>;
interface CollapsibleContentProps
  extends Omit<ShadcnCollapsibleContentProps, 'className' | 'style'> {
  animated?: boolean;
}

function Collapsible({ group, ...props }: CollapsibleProps) {
  return (
    <ShadcnCollapsible
      className={cn(group && 'group/collapsible')}
      {...props}
    />
  );
}

function CollapsibleTrigger({ layout, ...props }: CollapsibleTriggerProps) {
  return (
    <ShadcnCollapsibleTrigger
      className={cn(
        layout === 'inline' &&
          'flex items-center gap-2 py-2 font-medium text-sm hover:underline',
      )}
      {...props}
    />
  );
}

function CollapsibleContent({ animated, ...props }: CollapsibleContentProps) {
  return (
    <ShadcnCollapsibleContent
      className={cn(animated && 'CollapsibleContent')}
      {...props}
    />
  );
}

export { Collapsible, CollapsibleContent, CollapsibleTrigger };
