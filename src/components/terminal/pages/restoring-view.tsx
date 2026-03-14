import { EmptyState } from '@components/ui/empty-state';
import { Loader2 } from 'lucide-react';

export function RestoringView() {
  return (
    <EmptyState
      icon={Loader2}
      title="Restoring recording..."
      description="The recording is being restored from cold storage. This may take a few minutes. The page will update automatically."
    />
  );
}
