import type { ResetPasswordFormData } from '@components/org/forms/validation/reset-password-form.schema';
import { useMutation } from '@tanstack/react-query';
import { authClient } from '@/better-auth.client';

export function useResetPasswordMutation() {
  return useMutation({
    mutationFn: ({ email }: ResetPasswordFormData) => {
      return authClient.requestPasswordReset({
        email,
        redirectTo: `${import.meta.env.FRONTEND_BASE_URL}/update-password`,
      });
    },
  });
}

export type useResetPasswordMutationType = ReturnType<
  typeof useResetPasswordMutation
>;
