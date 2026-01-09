import { queryClient } from '@context/query.provider';
import { useMutation } from '@tanstack/react-query';
import { authClient } from '@/better-auth.client';

export function useLogoutAllMutation({
  handleSuccess,
}: {
  handleSuccess: () => void;
}) {
  return useMutation({
    mutationFn: () => {
      return authClient.revokeSessions({
        fetchOptions: {
          onSuccess: () => {
            handleSuccess();
            queryClient.removeQueries({
              queryKey: ['profile'],
            });
          },
        },
      });
    },
  });
}

export type useLogoutAllMutationType = ReturnType<typeof useLogoutAllMutation>;
