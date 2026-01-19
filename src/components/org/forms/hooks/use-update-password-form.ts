import { useAppForm } from '@components/org/forms/hooks/app-form';
import type { UseUpdatePasswordFormProps } from '@components/org/forms/hooks/use-update-password-form.types';
import type { UpdatePasswordFormData } from '@components/org/forms/validation/update-password-form.schema';
import { updatePasswordFormSchema } from '@components/org/forms/validation/update-password-form.schema';
import { logError } from '@lib/logger.utils';

export function useUpdatePasswordForm({
  updatePasswordMutation,
  handleSuccess,
}: UseUpdatePasswordFormProps) {
  const form = useAppForm({
    defaultValues: {
      password: '',
      confirm: '',
    },
    validators: {
      onBlur: updatePasswordFormSchema,
    },
    onSubmit({ value }) {
      updatePasswordMutation.mutate(
        {
          password: value.password,
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
              const errorMessage = data.error.message || '';
              const message =
                errorMessage || 'Something went wrong, please try again later.';

              if (!errorMessage) {
                logError({
                  message: 'Password update failed',
                  error: appError,
                });
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
                ? error.message
                : '';

            const message =
              errorMessage || 'Something went wrong, please try again later.';

            if (!errorMessage) {
              logError({ message: 'Password update failed', error });
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

export type UpdatePasswordFormType = ReturnType<typeof useUpdatePasswordForm>;
export type UpdatePasswordFormFieldName = keyof UpdatePasswordFormData;
