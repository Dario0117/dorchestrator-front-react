import type { LoginFormData } from '@domains/org/forms/validation/login-form.schema';
import { useMutation } from '@tanstack/react-query';
import { authClient } from '@/better-auth.client';

export function useLoginMutation() {
  return useMutation({
    mutationFn: ({ email, password }: LoginFormData) => {
      return authClient.signIn.email({
        email,
        password,
      });
    },
  });
}

export type useLoginMutationType = ReturnType<typeof useLoginMutation>;
