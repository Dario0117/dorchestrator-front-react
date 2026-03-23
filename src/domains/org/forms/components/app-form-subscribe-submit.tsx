import { Button } from '@components/ds/atoms/button';
import { useFormContext } from '@domains/org/forms/hooks/app-form';
import { cn } from '@lib/utils';

export function AppSubscribeSubmitButton({
  label,
  disabled = false,
  className,
}: {
  label: string;
  disabled?: boolean;
  className?: string;
}) {
  const form = useFormContext();
  return (
    <form.Subscribe selector={(state) => state.isDirty && !state.isSubmitting}>
      {(canSubmit) => (
        <Button
          type="submit"
          className={cn('w-full', className)}
          disabled={!canSubmit || disabled}
        >
          {label}
        </Button>
      )}
    </form.Subscribe>
  );
}
