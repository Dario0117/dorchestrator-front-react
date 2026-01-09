import { Alert, AlertTitle } from '@components/ui/alert';
import type { FormErrorDisplayProps } from '@components/ui/form-error-display.types';

export function FormErrorDisplay({ errors }: FormErrorDisplayProps) {
  if (!errors || !errors.length) {
    return null;
  }

  return (
    <div className="mt-4">
      <Alert variant="destructive">
        <AlertTitle>
          {errors.map((error) => (
            <span key={error}>{error}</span>
          ))}
        </AlertTitle>
      </Alert>
    </div>
  );
}
