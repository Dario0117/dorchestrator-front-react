import { useFormContext } from '@components/org/forms/hooks/app-form';
import { Button } from '@components/ui/button';

export function AppSubscribeSubmitButton({
  label,
  disabled = false,
}: {
  label: string;
  disabled?: boolean;
}) {
  const form = useFormContext();
  return (
    <form.Subscribe selector={(state) => state.isValid && !state.isPristine}>
      {(canSubmit) => (
        <Button
          type="submit"
          className="w-full"
          disabled={!canSubmit || disabled}
        >
          {label}
        </Button>
      )}
    </form.Subscribe>
  );
}
