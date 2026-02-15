const NON_FIELD_ERRORS_KEY = 'nonFieldErrors';
const DEFAULT_FORM_ERROR = 'Please fix the errors below';
const DEFAULT_FALLBACK_ERROR = 'Something went wrong, please try again later.';

export function setFormErrorsFromResponse(
  error: { responseErrors?: Record<string, unknown> | null },
  form: { setErrorMap(errorMap: unknown): void },
) {
  const responseErrors = error.responseErrors;

  if (!responseErrors) {
    form.setErrorMap({
      onSubmit: { form: DEFAULT_FALLBACK_ERROR, fields: {} },
    });
    return;
  }

  const fieldErrors: Record<string, unknown> = {};
  let nonFieldErrors: unknown;

  for (const [key, value] of Object.entries(responseErrors)) {
    if (!Array.isArray(value) || value.length === 0) {
      continue;
    }
    if (key === NON_FIELD_ERRORS_KEY) {
      nonFieldErrors = value;
    } else {
      fieldErrors[key] = value;
    }
  }

  const hasFieldErrors = Object.keys(fieldErrors).length > 0;

  form.setErrorMap({
    onSubmit: {
      form: hasFieldErrors
        ? DEFAULT_FORM_ERROR
        : (nonFieldErrors ?? DEFAULT_FALLBACK_ERROR),
      fields: fieldErrors,
    },
  });
}
