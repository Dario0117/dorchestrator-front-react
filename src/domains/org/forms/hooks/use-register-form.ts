import { useAppForm } from '@domains/org/forms/hooks/app-form';
import type { UseRegisterFormProps } from '@domains/org/forms/hooks/use-register-form.types';
import { registerFormSchema } from '@domains/org/forms/validation/register-form.schema';
import { logError } from '@lib/logger.utils';

export function useRegisterForm({
  registerMutation,
  handleSuccess,
}: UseRegisterFormProps) {
  const form = useAppForm({
    defaultValues: {
      name: '',
      password: '',
      confirm: '',
      email: '',
    },
    validators: {
      onSubmit: registerFormSchema,
    },
    onSubmit({ value }) {
      registerMutation.mutate(
        {
          name: value.name,
          password: value.password,
          email: value.email,
        },
        {
          onSuccess(data) {
            // better-auth returns errors wrapped in success response
            if (
              data &&
              typeof data === 'object' &&
              'error' in data &&
              data.error
            ) {
              const appError = data.error;
              const errorMessage = appError.message || '';
              const message =
                errorMessage || 'Something went wrong, please try again later.';

              if (!errorMessage) {
                logError({ error: appError }, 'Registration failed');
              }

              form.setErrorMap({
                onSubmit: { form: message, fields: {} },
              });
              return;
            }
            handleSuccess(data);
          },
          onError(error) {
            const errorMessage =
              error && typeof error === 'object' && 'message' in error
                ? (error as { message: string }).message
                : '';

            const message =
              errorMessage || 'Something went wrong, please try again later.';

            if (!errorMessage) {
              logError({ error }, 'Registration failed');
            }

            form.setErrorMap({
              onSubmit: { form: message, fields: {} },
            });
          },
        },
      );
    },
  });
  return form;
}
