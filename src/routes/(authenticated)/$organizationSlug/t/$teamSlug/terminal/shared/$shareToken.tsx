import { useCurrentOrganization } from '@domains/shared/hooks/use-current-organization';
import { SharedSessionPage } from '@domains/terminal/pages/shared-session.page';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute(
  '/(authenticated)/$organizationSlug/t/$teamSlug/terminal/shared/$shareToken',
)({
  component: SharedSessionRoute,
});

function SharedSessionRoute() {
  const { shareToken, organizationSlug } = Route.useParams();
  const currentOrganization = useCurrentOrganization();

  return (
    <SharedSessionPage
      shareToken={shareToken}
      organizationSlug={organizationSlug}
      organizationId={currentOrganization.id}
    />
  );
}
