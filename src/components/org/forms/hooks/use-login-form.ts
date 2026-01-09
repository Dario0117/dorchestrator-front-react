import { logError } from '@/lib/logger.utils';
import type { useLoginMutationType } from '@/services/users/login.http-service';
import { loginFormSchema } from '../validation/login-form.schema';
import { useAppForm } from './app-form';
import type { UseLoginFormProps } from './use-login-form.types';

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
      onChange: loginFormSchema,
      async onSubmitAsync({ value }) {
        try {
          const results = await loginMutation.mutateAsync({
            email: value.email,
            password: value.password,
          });
          if (results.error) {
            throw results.error;
          }
          if (results.data) {
            handleSuccess(
              results.data as unknown as useLoginMutationType['data'],
            );
          }
          throw results; // Rethrow to handle error
        } catch (exception: unknown) {
          const error = exception as useLoginMutationType['error'];
          if (!error?.message) {
            logError({
              message: 'Unexpected error type',
              error,
            });
            return {
              form: ['Something went wrong, please try again later.'],
              fields: {},
            };
          }
          return {
            form: [error.message],
            fields: {},
          };
        }
      },
    },
  });

  return form;
}
