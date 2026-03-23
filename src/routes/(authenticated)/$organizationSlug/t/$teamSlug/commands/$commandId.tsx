import { CommandDetailsPage } from '@domains/commands/pages/command-details.page';
import { useGetCommandQueryOptions } from '@domains/commands/services/get-command.http-service';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute(
  '/(authenticated)/$organizationSlug/t/$teamSlug/commands/$commandId',
)({
  component: CommandDetailsPage,
  loader: async (ctx) => {
    const currentOrganization = ctx.context.getCurrentOrganizationFromSlug(
      ctx.params.organizationSlug,
    );
    const currentTeam = ctx.context.getCurrentTeamFromSlug(
      currentOrganization.id,
      ctx.params.teamSlug,
    );
    await ctx.context.queryClient.ensureQueryData(
      useGetCommandQueryOptions(
        currentOrganization.id,
        currentTeam.id,
        Number(ctx.params.commandId),
      ),
    );
  },
});
