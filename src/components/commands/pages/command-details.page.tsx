import { CommandMetadata } from '@components/commands/command-metadata';
import { CommandOutput } from '@components/commands/command-output';
import { Alert, AlertDescription } from '@components/ui/alert';
import { Button } from '@components/ui/button';
import { useCurrentOrganization } from '@hooks/use-current-organization';
import { Route } from '@routes/(authenticated)/$organizationSlug/commands/$commandId';
import { useGetCommandSuspenseQuery } from '@services/commands/get-command.http-service';
import { useNavigate } from '@tanstack/react-router';
import { AlertTriangle, ArrowLeft, Info, Loader2 } from 'lucide-react';

export function CommandDetailsPage() {
  const currentOrganization = useCurrentOrganization();
  const { commandId, organizationSlug } = Route.useParams();
  const navigate = useNavigate();

  const { data } = useGetCommandSuspenseQuery(
    currentOrganization.id,
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
      to: '/$organizationSlug/commands',
      params: { organizationSlug },
    });
  };

  return (
    <section className="space-y-6 p-6 md:p-10">
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            aria-label="Back to commands"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold font-serif">
            Command #{command.id}
          </h1>
        </div>

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
      </div>
    </section>
  );
}
