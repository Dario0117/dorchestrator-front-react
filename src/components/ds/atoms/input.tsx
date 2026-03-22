import { Input as ShadcnInput } from '@components/ui/input';

type ShadcnInputProps = React.ComponentProps<typeof ShadcnInput>;

interface InputProps extends ShadcnInputProps {}

function Input(props: InputProps) {
  return <ShadcnInput {...props} />;
}

export { Input };
export type { InputProps };
