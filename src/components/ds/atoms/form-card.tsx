import { FormCard as ShadcnFormCard } from '@components/ui/form-card';

type ShadcnFormCardProps = React.ComponentProps<typeof ShadcnFormCard>;

interface FormCardProps extends ShadcnFormCardProps {}

function FormCard(props: FormCardProps) {
  return <ShadcnFormCard {...props} />;
}

export { FormCard };
