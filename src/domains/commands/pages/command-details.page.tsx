import { Alert, AlertDescription } from '@components/ds/atoms/alert';
import { Button } from '@components/ds/atoms/button';
import { HStack } from '@components/ds/atoms/hstack';
import { PageSection } from '@components/ds/atoms/page-section';
import { PageTitle } from '@components/ds/atoms/page-title';
import { Stack } from '@components/ds/atoms/stack';
import { CommandMetadata } from '@domains/commands/components/command-metadata';
import { CommandOutput } from '@domains/commands/components/command-output';
import { useGetCommandSuspenseQuery } from '@domains/commands/services/get-command.http-service';
import { useCurrentOrganization } from '@domains/shared/hooks/use-current-organization';
import { useCurrentTeam } from '@domains/shared/hooks/use-current-team';
import { Route } from '@routes/(authenticated)/$organizationSlug/t/$teamSlug/commands/$commandId';
import { useNavigate } from '@tanstack/react-router';
import { AlertTriangle, ArrowLeft, Info, Loader2 } from 'lucide-react';

export function CommandDetailsPage() {
  const currentOrganization = useCurrentOrganization();
  const currentTeam = useCurrentTeam();
  const { commandId, organizationSlug, teamSlug } = Route.useParams();
  const navigate = useNavigate();

  const { data } = useGetCommandSuspenseQuery(
    currentOrganization.id,
    currentTeam.id,
    Number(commandId),
  );

  const command = data.responseData?.results;

  if (!command) {
    return null;
  }

  const showResults =
    command.status === 'completed' || command.status === 'failed';

  const handleBack = () => {
    navigate({
      to: '/$organizationSlug/t/$teamSlug/commands',
      params: { organizationSlug, teamSlug },
    });
  };

  return (
    <PageSection>
      <Stack gap="xl">
        <HStack gap="lg">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            aria-label="Back to commands"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <PageTitle>Command #{command.id}</PageTitle>
        </HStack>

        <CommandMetadata command={command} />

        {command.status === 'pending' && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Command is queued and waiting for device to poll
            </AlertDescription>
          </Alert>
        )}

        {command.status === 'running' && (
          <Alert>
            <Loader2 className="h-4 w-4 animate-spin" />
            <AlertDescription>
              Command is executing on device...
            </AlertDescription>
          </Alert>
        )}

        {command.status === 'failed' && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Command failed. See error output below.
            </AlertDescription>
          </Alert>
        )}

        {showResults && (
          <CommandOutput
            results={command.results}
            commandId={command.id}
          />
        )}
      </Stack>
    </PageSection>
  );
}
