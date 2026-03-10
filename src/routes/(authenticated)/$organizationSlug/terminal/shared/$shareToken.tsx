import { SharedSessionPage } from '@components/terminal/pages/shared-session.page';
import { useCurrentOrganization } from '@hooks/use-current-organization';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute(
  '/(authenticated)/$organizationSlug/terminal/shared/$shareToken',
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
