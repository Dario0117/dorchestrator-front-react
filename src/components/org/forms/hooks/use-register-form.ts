import { logError } from '@/lib/logger.utils';
import type { useRegisterMutationType } from '@/services/users/register.http-service';
import { registerFormSchema } from '../validation/register-form.schema';
import { useAppForm } from './app-form';
import type { UseRegisterFormProps } from './use-register-form.types';

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
      onChange: registerFormSchema,
      async onSubmitAsync({ value }) {
        try {
          const results = await registerMutation.mutateAsync({
            name: value.name,
            password: value.password,
            email: value.email,
          });
          if (results.error) {
            throw results.error;
          }
          if (results.data) {
            handleSuccess(
              results.data as unknown as useRegisterMutationType['data'],
            );
          }
          throw results; // Rethrow to handle error
        } catch (exception: unknown) {
          const error = exception as useRegisterMutationType['error'];
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
