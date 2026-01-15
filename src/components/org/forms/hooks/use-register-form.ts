import { useAppForm } from '@components/org/forms/hooks/app-form';
import type { UseRegisterFormProps } from '@components/org/forms/hooks/use-register-form.types';
import { registerFormSchema } from '@components/org/forms/validation/register-form.schema';
import { handleFormSubmission } from '@lib/form-submission.utils';

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
      async onSubmitAsync({ value }) {
        return await handleFormSubmission({
          formValues: value,
          schema: registerFormSchema,
          mutation: registerMutation,
          mapToMutationData: (data) => ({
            name: data.name,
            password: data.password,
            email: data.email,
          }),
          handleSuccess,
          errorContext: 'Registration failed',
        });
      },
    },
  });
  return form;
}
