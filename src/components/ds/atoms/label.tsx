import { Label as ShadcnLabel } from '@components/ui/label';

type ShadcnLabelProps = React.ComponentProps<typeof ShadcnLabel>;

interface LabelProps extends Omit<ShadcnLabelProps, 'className' | 'style'> {}

function Label(props: LabelProps) {
  return <ShadcnLabel {...props} />;
}

export { Label };
export type { LabelProps };
