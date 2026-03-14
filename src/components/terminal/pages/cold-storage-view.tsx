import { Button } from '@components/ui/button';
import { EmptyState } from '@components/ui/empty-state';
import { useRestoreRecordingMutation } from '@services/terminal/restore-recording.http-service';
import { FileWarning } from 'lucide-react';

export function ColdStorageView({
  organizationId,
  sessionId,
}: {
  organizationId: string;
  sessionId: number;
}) {
  const restoreMutation = useRestoreRecordingMutation();

  return (
    <EmptyState
      icon={FileWarning}
      title="Recording archived"
      description="This recording has been moved to cold storage. Restore it to view the playback."
      action={
        <Button
          onClick={() =>
            restoreMutation.mutate({
              params: {
                path: { organizationId, sessionId },
              },
            })
          }
          disabled={restoreMutation.isPending}
        >
          {restoreMutation.isPending ? 'Requesting...' : 'Restore Recording'}
        </Button>
      }
    />
  );
}
