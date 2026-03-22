import { Separator as ShadcnSeparator } from '@components/ui/separator';

type ShadcnSeparatorProps = React.ComponentProps<typeof ShadcnSeparator>;

interface SeparatorProps extends ShadcnSeparatorProps {}

function Separator(props: SeparatorProps) {
  return <ShadcnSeparator {...props} />;
}

export { Separator };
export type { SeparatorProps };
