import { isValidSlug } from '@lib/organization-logo.utils';
import { z } from 'zod/v4';

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
