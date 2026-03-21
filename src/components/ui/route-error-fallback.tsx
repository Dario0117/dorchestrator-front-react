import { PageSection } from '@components/layout/page-section';
import { SectionTitle } from '@components/layout/section-title';
import { AlertTriangle } from 'lucide-react';
import { EmptyState } from './empty-state';

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
        <SectionTitle className="mb-6">{pageTitle}</SectionTitle>
        <EmptyState
          icon={AlertTriangle}
          title={errorTitle}
          description={errorDescription}
          action={
            <button
              type="button"
              onClick={reset}
              className="inline-flex h-11 items-center justify-center rounded-md border border-input bg-background px-4 text-base font-medium shadow-xs hover:bg-accent hover:text-accent-foreground md:text-sm"
            >
              Try again
            </button>
          }
        />
      </div>
    </PageSection>
  );
}
