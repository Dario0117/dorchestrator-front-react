import { useAppForm } from '@components/org/forms/hooks/app-form';
import type { UseLoginFormProps } from '@components/org/forms/hooks/use-login-form.types';
import { loginFormSchema } from '@components/org/forms/validation/login-form.schema';
import { handleFormSubmission } from '@lib/form-submission.utils';

export function useLoginForm({
  loginMutation,
  handleSuccess,
}: UseLoginFormProps) {
  const form = useAppForm({
    defaultValues: {
      email: '',
      password: '',
    },
    validators: {
      async onSubmitAsync({ value }) {
        return await handleFormSubmission({
          formValues: value,
          schema: loginFormSchema,
          mutation: loginMutation,
          mapToMutationData: (data) => ({
            email: data.email,
            password: data.password,
          }),
          handleSuccess,
          errorContext: 'Login failed',
        });
      },
    },
  });

  return form;
}
