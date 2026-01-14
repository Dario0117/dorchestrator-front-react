import { useAppForm } from '@components/org/forms/hooks/app-form';
import type { UseUpdatePasswordFormProps } from '@components/org/forms/hooks/use-update-password-form.types';
import { updatePasswordFormSchema } from '@components/org/forms/validation/update-password-form.schema';
import { logError } from '@lib/logger.utils';
import type { useUpdatePasswordMutationType } from '@services/users/update-password.http-service';

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
      onBlur: updatePasswordFormSchema,
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
