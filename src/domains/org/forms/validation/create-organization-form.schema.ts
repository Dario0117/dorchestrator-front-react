import { isValidSlug } from '@lib/organization-logo.utils';
import { z } from 'zod/v4';
import type {
  ApiRequestBody,
  Expect,
  IsExact,
} from '@/types/form-api-sync.types';

export const createOrganizationFormSchema = z.object({
  name: z
    .string()
    .min(1, 'Organization name is required')
    .max(100, 'Organization name must be less than 100 characters'),
  slug: z
    .string()
    .min(1, 'Organization slug is required')
    .max(50, 'Organization slug must be less than 50 characters')
    .refine(
      (slug) => isValidSlug(slug),
      'Slug must contain only lowercase letters, numbers, and hyphens',
    ),
});

export type CreateOrganizationFormData = z.infer<
  typeof createOrganizationFormSchema
>;

// Compile-time check: if the API contract changes, this will error with
// "Type 'false' does not satisfy the constraint 'true'"
export type FormApiSync = Expect<
  IsExact<CreateOrganizationFormData, ApiRequestBody<'postApiV1Organizations'>>
>;
