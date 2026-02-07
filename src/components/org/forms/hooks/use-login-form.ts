import { useAppForm } from '@components/org/forms/hooks/app-form';
import type { UseLoginFormProps } from '@components/org/forms/hooks/use-login-form.types';
import type { LoginFormData } from '@components/org/forms/validation/login-form.schema';
import { loginFormSchema } from '@components/org/forms/validation/login-form.schema';
import { logError } from '@lib/logger.utils';

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
      onBlur: loginFormSchema,
    },
    onSubmit({ value }) {
      loginMutation.mutate(value, {
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
              logError({ error: appError }, 'Login failed');
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
            logError({ error }, 'Login failed');
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

export type LoginFormType = ReturnType<typeof useLoginForm>;
export type LoginFormFieldName = keyof LoginFormData;
