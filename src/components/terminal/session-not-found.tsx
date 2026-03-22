import { Button } from '@components/ds/atoms/button';
import { SecondaryParagraph } from '@components/ds/atoms/secondary-paragraph';
import { Link } from '@tanstack/react-router';
import { AlertTriangle, ArrowLeft } from 'lucide-react';

export function SessionNotFound({
  organizationSlug,
  teamSlug,
}: {
  organizationSlug: string;
  teamSlug: string;
}) {
  return (
    <div className="flex h-full items-center justify-center p-6">
      <div className="space-y-4 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <AlertTriangle className="h-6 w-6 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-semibold">Session not found</h2>
        <SecondaryParagraph>
          This session does not exist or you don&apos;t have access to it.
        </SecondaryParagraph>
        <Button
          variant="outline"
          render={
            <Link
              to="/$organizationSlug/t/$teamSlug/terminal"
              params={{ organizationSlug, teamSlug }}
            />
          }
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to sessions
        </Button>
      </div>
    </div>
  );
}
