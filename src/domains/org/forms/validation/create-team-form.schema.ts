import { isValidSlug } from '@lib/organization-logo.utils';
import { z } from 'zod/v4';
import type {
  ApiRequestBody,
  Expect,
  IsExact,
} from '@/types/form-api-sync.types';

export const createTeamFormSchema = z.object({
  name: z
    .string()
    .min(1, 'Team name is required')
    .max(100, 'Team name must be less than 100 characters'),
  slug: z
    .string()
    .min(1, 'Team slug is required')
    .max(100, 'Team slug must be less than 100 characters')
    .refine(
      (slug) => isValidSlug(slug),
      'Slug must contain only lowercase letters, numbers, and hyphens',
    ),
});

export type CreateTeamFormData = z.infer<typeof createTeamFormSchema>;

// Compile-time check: if the API contract changes, this will error with
// "Type 'false' does not satisfy the constraint 'true'"
export type FormApiSync = Expect<
  IsExact<CreateTeamFormData, ApiRequestBody<'postApiV1ByOrganizationIdTeams'>>
>;
