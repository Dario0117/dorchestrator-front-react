import { PasswordInput as ShadcnPasswordInput } from '@components/ui/password-input';

type ShadcnPasswordInputProps = React.ComponentProps<
  typeof ShadcnPasswordInput
>;

interface PasswordInputProps extends Omit<ShadcnPasswordInputProps, 'type'> {}

function PasswordInput(props: PasswordInputProps) {
  return <ShadcnPasswordInput {...props} />;
}

export { PasswordInput };
