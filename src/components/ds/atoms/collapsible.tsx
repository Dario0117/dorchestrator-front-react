import {
  Collapsible as ShadcnCollapsible,
  CollapsibleContent as ShadcnCollapsibleContent,
  CollapsibleTrigger as ShadcnCollapsibleTrigger,
} from '@components/ui/collapsible';

type ShadcnCollapsibleProps = React.ComponentProps<typeof ShadcnCollapsible>;
interface CollapsibleProps extends ShadcnCollapsibleProps {}

type ShadcnCollapsibleTriggerProps = React.ComponentProps<
  typeof ShadcnCollapsibleTrigger
>;
interface CollapsibleTriggerProps extends ShadcnCollapsibleTriggerProps {}

type ShadcnCollapsibleContentProps = React.ComponentProps<
  typeof ShadcnCollapsibleContent
>;
interface CollapsibleContentProps extends ShadcnCollapsibleContentProps {}

function Collapsible(props: CollapsibleProps) {
  return <ShadcnCollapsible {...props} />;
}

function CollapsibleTrigger(props: CollapsibleTriggerProps) {
  return <ShadcnCollapsibleTrigger {...props} />;
}

function CollapsibleContent(props: CollapsibleContentProps) {
  return <ShadcnCollapsibleContent {...props} />;
}

export { Collapsible, CollapsibleContent, CollapsibleTrigger };
export type {
  CollapsibleContentProps,
  CollapsibleProps,
  CollapsibleTriggerProps,
};
