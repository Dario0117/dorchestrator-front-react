import { useMutation } from '@tanstack/react-query';
import type { RegisterFormData } from '@/components/org/forms/validation/register-form.schema';
import { authClient } from '../../better-auth.client';

export function useRegisterMutation() {
  return useMutation({
    mutationFn: ({
      name,
      email,
      password,
    }: Omit<RegisterFormData, 'confirm'>) => {
      return authClient.signUp.email({
        name,
        email,
        password,
      });
    },
  });
}

export type useRegisterMutationType = ReturnType<typeof useRegisterMutation>;
