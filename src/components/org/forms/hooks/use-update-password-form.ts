import { logError } from '@/lib/logger.utils';
import type { useUpdatePasswordMutationType } from '@/services/users/update-password.http-service';
import { updatePasswordFormSchema } from '../validation/update-password-form.schema';
import { useAppForm } from './app-form';
import type { UseUpdatePasswordFormProps } from './use-update-password-form.types';

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
      onChange: updatePasswordFormSchema,
      async onSubmitAsync({ value }) {
        try {
          const results = await updatePasswordMutation.mutateAsync({
            password: value.password,
          });
          if (results.error) {
            throw results.error;
          }
          if (results.data) {
            handleSuccess(
              results.data as unknown as useUpdatePasswordMutationType['data'],
            );
          }
          throw results; // Rethrow to handle error
        } catch (exception: unknown) {
          const error = exception as useUpdatePasswordMutationType['error'];
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
