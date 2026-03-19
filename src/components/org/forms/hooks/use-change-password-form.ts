import { useAppForm } from '@components/org/forms/hooks/app-form';
import type { UseChangePasswordFormProps } from '@components/org/forms/hooks/use-change-password-form.types';
import type { ChangePasswordFormData } from '@components/org/forms/validation/change-password-form.schema';
import { changePasswordFormSchema } from '@components/org/forms/validation/change-password-form.schema';
import { logError } from '@lib/logger.utils';

export function useChangePasswordForm({
  changePasswordMutation,
  handleSuccess,
}: UseChangePasswordFormProps) {
  const form = useAppForm({
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirm: '',
    },
    validators: {
      onSubmit: changePasswordFormSchema,
    },
    onSubmit({ value }) {
      changePasswordMutation.mutate(
        {
          currentPassword: value.currentPassword,
          newPassword: value.newPassword,
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
                logError({ error: appError }, 'Change password failed');
              }

              form.setErrorMap({
                onSubmit: { form: message, fields: {} },
              });
              return;
            }
            form.reset();
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
              logError({ error }, 'Change password failed');
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

export type ChangePasswordFormType = ReturnType<typeof useChangePasswordForm>;
export type ChangePasswordFormFieldName = keyof ChangePasswordFormData;
