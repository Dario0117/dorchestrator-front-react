import { AlertTriangle } from 'lucide-react';
import { Box } from './box';
import { Button } from './button';
import { EmptyState } from './empty-state';
import { PageSection } from './page-section';
import { SectionTitle } from './section-title';

interface RouteErrorFallbackProps {
  pageTitle: string;
  errorTitle: string;
  errorDescription: string;
  reset: () => void;
}

export function RouteErrorFallback({
  pageTitle,
  errorTitle,
  errorDescription,
  reset,
}: RouteErrorFallbackProps) {
  return (
    <PageSection>
      <div className="py-6">
        <Box spaceBelow="lg">
          <SectionTitle>{pageTitle}</SectionTitle>
        </Box>
        <EmptyState
          icon={AlertTriangle}
          title={errorTitle}
          description={errorDescription}
          action={
            <Button
              variant="outline"
              onClick={reset}
            >
              Try again
            </Button>
          }
        />
      </div>
    </PageSection>
  );
}

export type { RouteErrorFallbackProps };
