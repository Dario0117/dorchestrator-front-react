import type { UpdatePasswordFormData } from '@domains/org/forms/validation/update-password-form.schema';
import { useMutation } from '@tanstack/react-query';
import { authClient } from '@/better-auth.client';

export function useUpdatePasswordMutation(token: string) {
  return useMutation({
    mutationFn: ({ password }: Omit<UpdatePasswordFormData, 'confirm'>) => {
      return authClient.resetPassword({
        newPassword: password,
        token,
      });
    },
  });
}

export type useUpdatePasswordMutationType = ReturnType<
  typeof useUpdatePasswordMutation
>;
