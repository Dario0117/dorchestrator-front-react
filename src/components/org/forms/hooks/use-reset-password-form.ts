import { logError } from '@/lib/logger.utils';
import type { useResetPasswordMutationType } from '@/services/users/reset-password.http-service';
import { resetPasswordFormSchema } from '../validation/reset-password-form.schema';
import { useAppForm } from './app-form';
import type { UseResetPasswordFormProps } from './use-reset-password-form.types';

export function useResetPasswordForm({
  resetPasswordMutation,
  handleSuccess,
}: UseResetPasswordFormProps) {
  const form = useAppForm({
    defaultValues: {
      email: '',
    },
    validators: {
      onChange: resetPasswordFormSchema,
      async onSubmitAsync({ value }) {
        try {
          const results = await resetPasswordMutation.mutateAsync({
            email: value.email,
          });
          if (results.error) {
            throw results.error;
          }
          if (results.data) {
            handleSuccess(
              results.data as unknown as useResetPasswordMutationType['data'],
            );
          }
          throw results; // Rethrow to handle error
        } catch (exception: unknown) {
          const error = exception as useResetPasswordMutationType['error'];
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
