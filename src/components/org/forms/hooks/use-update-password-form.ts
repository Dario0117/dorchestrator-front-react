import { useAppForm } from '@components/org/forms/hooks/app-form';
import type { UseUpdatePasswordFormProps } from '@components/org/forms/hooks/use-update-password-form.types';
import { updatePasswordFormSchema } from '@components/org/forms/validation/update-password-form.schema';
import { handleFormSubmission } from '@lib/form-submission.utils';

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
      async onSubmitAsync({ value }) {
        return await handleFormSubmission({
          formValues: value,
          schema: updatePasswordFormSchema,
          mutation: updatePasswordMutation,
          mapToMutationData: (data) => ({
            password: data.password,
          }),
          handleSuccess,
          errorContext: 'Password update failed',
        });
      },
    },
  });
  return form;
}
