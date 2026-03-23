import { FormErrorDisplay } from '@components/ds/atoms/form-error-display';
import { useFormContext } from '@domains/org/forms/hooks/app-form';

function extractErrors(
  errorMap: Record<string, unknown> | undefined,
): string[] | undefined {
  const onSubmitError = errorMap?.onSubmit;
  if (!onSubmitError) {
    return undefined;
  }

  // Handle case where error is directly a string or array
  if (typeof onSubmitError === 'string') {
    return [onSubmitError];
  }
  if (Array.isArray(onSubmitError)) {
    return onSubmitError;
  }

  // Handle case where error is an object with form property
  if (typeof onSubmitError === 'object' && onSubmitError !== null) {
    const formError = (onSubmitError as { form?: unknown }).form;
    if (typeof formError === 'string') {
      return [formError];
    }
    if (Array.isArray(formError)) {
      return formError;
    }
  }

  return undefined;
}

export function AppSubscribeErrorButton() {
  const form = useFormContext();
  return (
    <form.Subscribe selector={(state) => [state.errorMap]}>
      {([errorMap]) => {
        const errors = extractErrors(errorMap);
        return <FormErrorDisplay errors={errors} />;
      }}
    </form.Subscribe>
  );
}
