import { useMutation } from '@tanstack/react-query';
import type { ResetPasswordFormData } from '@/components/org/forms/validation/reset-password-form.schema';
import { authClient } from '../auth.http-service';

export function useResetPasswordMutation() {
  return useMutation({
    mutationFn: ({ email }: ResetPasswordFormData) => {
      return authClient.requestPasswordReset({
        email,
        redirectTo: 'http://localhost:5173/update-password',
      });
    },
  });
}

export type useResetPasswordMutationType = ReturnType<
  typeof useResetPasswordMutation
>;
