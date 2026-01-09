import { useMutation } from '@tanstack/react-query';
import { logError } from '@/lib/logger.utils';
import { authClient } from '../../better-auth.client';

export function useCheckSlugAvailabilityMutation() {
  return useMutation({
    mutationFn: async (slug: string) => {
      const result = await authClient.organization.checkSlug({
        slug,
      });

      if (result.error) {
        logError({
          message: 'Organization slug check failed',
          error: result.error,
        });

        // 409 means slug is taken, other errors are actual errors
        // Better-auth error object includes status code from HTTP response
        const status =
          result.error?.status ??
          // @ts-expect-error - checking for alternative statusCode property
          result.error?.statusCode;

        const isTaken = status === 409;

        if (isTaken) {
          return { available: false, taken: true, error: null };
        }

        return { available: false, taken: false, error: result.error.message };
      }

      return { available: true, taken: false, error: null };
    },
  });
}

export type useCheckSlugAvailabilityMutationType = ReturnType<
  typeof useCheckSlugAvailabilityMutation
>;
