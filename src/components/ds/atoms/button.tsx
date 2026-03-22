import { buttonVariants, Button as ShadcnButton } from '@components/ui/button';

type ShadcnButtonProps = React.ComponentProps<typeof ShadcnButton>;

interface ButtonProps extends ShadcnButtonProps {}

function Button(props: ButtonProps) {
  return <ShadcnButton {...props} />;
}

export { Button, buttonVariants };
export type { ButtonProps };
