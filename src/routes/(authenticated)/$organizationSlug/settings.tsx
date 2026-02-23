import { OrganizationSettingsPage } from '@components/org/pages/organization-settings.page';
import { useOrganizationDetailsQueryOptions } from '@services/organizations/get-organization-details.http-service';
import { useListMembersQueryOptions } from '@services/organizations/list-members.http-service';
import { MEMBER_ROLES } from '@services/organizations/list-members.http-service.constants';
import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod/v4';

const searchParamsSchema = z.object({
  page: z.coerce.number().int().positive().default(1).catch(1),
  size: z.coerce.number().int().positive().max(100).default(10).catch(10),
  search: z.string().optional().catch(undefined),
  role: z.enum(MEMBER_ROLES).optional().catch(undefined),
});

export const Route = createFileRoute(
  '/(authenticated)/$organizationSlug/settings',
)({
  validateSearch: searchParamsSchema,
  component: OrganizationSettingsPage,
  loaderDeps: ({ search: { page, size, search, role } }) => ({
    page,
    size,
    search,
    role,
  }),
  loader: async (ctx) => {
    const currentOrganization = ctx.context.getCurrentOrganizationFromSlug(
      ctx.params.organizationSlug,
    );
    await Promise.all([
      ctx.context.queryClient.ensureQueryData(
        useOrganizationDetailsQueryOptions(currentOrganization.id),
      ),
      ctx.context.queryClient.ensureQueryData(
        useListMembersQueryOptions(currentOrganization.id, {
          page: ctx.deps.page,
          size: ctx.deps.size,
          search: ctx.deps.search,
          role: ctx.deps.role,
        }),
      ),
    ]);
  },
});
