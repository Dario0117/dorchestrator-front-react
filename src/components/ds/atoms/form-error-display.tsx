import { FormErrorDisplay as ShadcnFormErrorDisplay } from '@components/ui/form-error-display';
import type { FormErrorDisplayProps as ShadcnFormErrorDisplayProps } from '@components/ui/form-error-display.types';

type FormErrorDisplayProps = ShadcnFormErrorDisplayProps;

function FormErrorDisplay(props: FormErrorDisplayProps) {
  return <ShadcnFormErrorDisplay {...props} />;
}

export { FormErrorDisplay };
