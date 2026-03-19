import { useAppForm } from '@components/org/forms/hooks/app-form';
import type { UseResetPasswordFormProps } from '@components/org/forms/hooks/use-reset-password-form.types';
import type { ResetPasswordFormData } from '@components/org/forms/validation/reset-password-form.schema';
import { resetPasswordFormSchema } from '@components/org/forms/validation/reset-password-form.schema';
import { logError } from '@lib/logger.utils';

export function useResetPasswordForm({
  resetPasswordMutation,
  handleSuccess,
}: UseResetPasswordFormProps) {
  const form = useAppForm({
    defaultValues: {
      email: '',
    },
    validators: {
      onSubmit: resetPasswordFormSchema,
    },
    onSubmit({ value }) {
      resetPasswordMutation.mutate(value, {
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
              logError({ error: appError }, 'Password reset failed');
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
            logError({ error }, 'Password reset failed');
          }

          form.setErrorMap({
            onSubmit: { form: message, fields: {} },
          });
        },
      });
    },
  });
  return form;
}

export type ResetPasswordFormType = ReturnType<typeof useResetPasswordForm>;
export type ResetPasswordFormFieldName = keyof ResetPasswordFormData;
