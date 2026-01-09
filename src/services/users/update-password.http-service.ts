import { useMutation } from '@tanstack/react-query';
import type { UpdatePasswordFormData } from '@/components/org/forms/validation/update-password-form.schema';
import { authClient } from '../../better-auth.client';

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
