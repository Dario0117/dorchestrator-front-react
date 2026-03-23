import { useMutation } from '@tanstack/react-query';
import { authClient } from '@/better-auth.client';

export function useLogoutMutation({
  handleSuccess,
}: {
  handleSuccess: () => void;
}) {
  return useMutation({
    mutationFn: () => {
      return authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            handleSuccess();
          },
        },
      });
    },
  });
}

export type useLogoutMutationType = ReturnType<typeof useLogoutMutation>;
