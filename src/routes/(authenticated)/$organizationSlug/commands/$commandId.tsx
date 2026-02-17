import { CommandDetailsPage } from '@components/commands/pages/command-details.page';
import { useGetCommandQueryOptions } from '@services/commands/get-command.http-service';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute(
  '/(authenticated)/$organizationSlug/commands/$commandId',
)({
  component: CommandDetailsPage,
  loader: async (ctx) => {
    const currentOrganization = ctx.context.getCurrentOrganizationFromSlug(
      ctx.params.organizationSlug,
    );
    await ctx.context.queryClient.ensureQueryData(
      useGetCommandQueryOptions(
        currentOrganization.id,
        Number(ctx.params.commandId),
      ),
    );
  },
});
