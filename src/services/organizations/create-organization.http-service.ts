import { useMutation } from '@tanstack/react-query';
import type { CreateOrganizationFormData } from '@/components/org/forms/validation/create-organization-form.schema';
import { logError } from '@/lib/logger.utils';
import { authClient } from '../auth.http-service';

export function useCreateOrganizationMutation() {
  return useMutation({
    mutationFn: async ({ name, slug }: CreateOrganizationFormData) => {
      const result = await authClient.organization.create({
        name,
        slug,
      });

      if (result.error) {
        logError({
          message: 'Organization creation failed',
          error: result.error,
        });
        throw new Error(
          result.error.message ?? 'Failed to create organization',
        );
      }

      return result.data;
    },
  });
}

export type useCreateOrganizationMutationType = ReturnType<
  typeof useCreateOrganizationMutation
>;
