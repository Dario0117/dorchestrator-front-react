import { useAppForm } from '@components/org/forms/hooks/app-form';
import type { UseResetPasswordFormProps } from '@components/org/forms/hooks/use-reset-password-form.types';
import { resetPasswordFormSchema } from '@components/org/forms/validation/reset-password-form.schema';
import { handleFormSubmission } from '@lib/form-submission.utils';

export function useResetPasswordForm({
  resetPasswordMutation,
  handleSuccess,
}: UseResetPasswordFormProps) {
  const form = useAppForm({
    defaultValues: {
      email: '',
    },
    validators: {
      async onSubmitAsync({ value }) {
        return await handleFormSubmission({
          formValues: value,
          schema: resetPasswordFormSchema,
          mutation: resetPasswordMutation,
          mapToMutationData: (data) => ({
            email: data.email,
          }),
          handleSuccess,
          errorContext: 'Password reset failed',
        });
      },
    },
  });
  return form;
}
