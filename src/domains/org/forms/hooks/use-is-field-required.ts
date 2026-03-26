import { useFieldContext } from '@domains/org/forms/hooks/app-form';

export function useIsFieldRequired() {
  const field = useFieldContext();
  const validators = field.form.options.validators;
  const schema = validators?.onSubmit;

  if (!schema || typeof schema !== 'object' || !('shape' in schema)) {
    return false;
  }

  const fieldSchema = (
    schema as {
      shape: Record<
        string,
        { safeParse: (v: unknown) => { success: boolean } }
      >;
    }
  ).shape[field.name];

  if (!fieldSchema || typeof fieldSchema.safeParse !== 'function') {
    return false;
  }

  const acceptsUndefined = fieldSchema.safeParse(undefined).success;
  const acceptsEmptyString = fieldSchema.safeParse('').success;

  return !acceptsUndefined && !acceptsEmptyString;
}
