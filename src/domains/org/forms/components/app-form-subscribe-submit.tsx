import { Button, type ButtonProps } from '@components/ds/atoms/button';
import { useFormContext } from '@domains/org/forms/hooks/app-form';

export function AppSubscribeSubmitButton({
  label,
  disabled = false,
  size,
  fullWidth = true,
}: {
  label: string;
  disabled?: boolean;
  size?: ButtonProps['size'];
  fullWidth?: boolean;
}) {
  const form = useFormContext();
  return (
    <form.Subscribe selector={(state) => state.isDirty && !state.isSubmitting}>
      {(canSubmit) => (
        <Button
          type="submit"
          size={size}
          fullWidth={fullWidth}
          disabled={!canSubmit || disabled}
        >
          {label}
        </Button>
      )}
    </form.Subscribe>
  );
}
