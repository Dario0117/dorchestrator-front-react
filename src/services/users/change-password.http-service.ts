import type { ChangePasswordFormData } from '@components/org/forms/validation/change-password-form.schema';
import { useMutation } from '@tanstack/react-query';
import { authClient } from '@/better-auth.client';

export function useChangePasswordMutation() {
  return useMutation({
    mutationFn: ({
      currentPassword,
      newPassword,
    }: Omit<ChangePasswordFormData, 'confirm'>) => {
      return authClient.changePassword({
        currentPassword,
        newPassword,
        revokeOtherSessions: false,
      });
    },
  });
}

export type useChangePasswordMutationType = ReturnType<
  typeof useChangePasswordMutation
>;
