import { AuditLogsListPage } from '@components/audit-logs/pages/audit-logs-list.page';
import { useAuditLogsQueryOptions } from '@services/audit-logs/list-audit-logs.http-service';
import {
  AUDIT_LOG_ACTIONS,
  AUDIT_LOG_RESOURCE_TYPES,
} from '@services/audit-logs/list-audit-logs.http-service.constants';
import { createFileRoute } from '@tanstack/react-router';
import { Suspense } from 'react';
import { z } from 'zod/v4';

const searchParamsSchema = z.object({
  page: z.coerce.number().int().positive().default(1).catch(1),
  size: z.coerce.number().int().positive().max(100).default(25).catch(25),
  action: z.enum(AUDIT_LOG_ACTIONS).optional().catch(undefined),
  resourceType: z.enum(AUDIT_LOG_RESOURCE_TYPES).optional().catch(undefined),
  fromDate: z.string().optional().catch(undefined),
  toDate: z.string().optional().catch(undefined),
});

export const Route = createFileRoute(
  '/(authenticated)/$organizationSlug/audit-logs/',
)({
  validateSearch: searchParamsSchema,
  component: AuditLogsRoute,
  loaderDeps: ({
    search: { page, size, action, resourceType, fromDate, toDate },
  }) => ({ page, size, action, resourceType, fromDate, toDate }),
  loader: async (ctx) => {
    const currentOrganization = ctx.context.getCurrentOrganizationFromSlug(
      ctx.params.organizationSlug,
    );
    await ctx.context.queryClient.ensureQueryData(
      useAuditLogsQueryOptions(currentOrganization.id, {
        page: ctx.deps.page,
        size: ctx.deps.size,
        action: ctx.deps.action,
        resourceType: ctx.deps.resourceType,
        fromDate: ctx.deps.fromDate,
        toDate: ctx.deps.toDate,
      }),
    );
  },
});

function AuditLogsRoute() {
  return (
    <Suspense
      fallback={<div className="p-6 md:p-10">Loading audit logs...</div>}
    >
      <AuditLogsListPage />
    </Suspense>
  );
}
