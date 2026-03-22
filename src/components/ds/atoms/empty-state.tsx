import { EmptyState as ShadcnEmptyState } from '@components/ui/empty-state';

type ShadcnEmptyStateProps = React.ComponentProps<typeof ShadcnEmptyState>;

interface EmptyStateProps extends ShadcnEmptyStateProps {}

function EmptyState(props: EmptyStateProps) {
  return <ShadcnEmptyState {...props} />;
}

export { EmptyState };
export type { EmptyStateProps };
