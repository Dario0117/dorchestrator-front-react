import { Box } from '@components/ds/atoms/box';
import { Button } from '@components/ds/atoms/button';
import { EmptyState } from '@components/ds/atoms/empty-state';
import { HStack } from '@components/ds/atoms/hstack';
import { PageSection } from '@components/ds/atoms/page-section';
import { SectionTitle } from '@components/ds/atoms/section-title';
import { FilterChips } from '@components/ds/molecules/filter-chips';
import { FilterPanel } from '@components/ds/molecules/filter-panel';
import { PageHeadingBar } from '@components/ds/molecules/page-heading-bar';
import { DataTable } from '@components/ds/organisms/data-table';
import { PaginatedFooter } from '@components/ds/organisms/paginated-footer';
import { useCurrentOrganization } from '@domains/shared/hooks/use-current-organization';
import { useCurrentTeam } from '@domains/shared/hooks/use-current-team';
import { TerminalSessionFilterControls } from '@domains/terminal/filters/terminal-session-filters';
import { useTerminalFilterState } from '@domains/terminal/hooks/use-terminal-filter-state';
import { SessionHistoryExportDialog } from '@domains/terminal/modals/session-history-export-dialog';
import { useTerminalSessionsSuspenseQuery } from '@domains/terminal/services/list-terminal-sessions.http-service';
import { useTerminateTerminalSessionMutation } from '@domains/terminal/services/terminate-terminal-session.http-service';
import { TerminalSessionsTable } from '@domains/terminal/tables/terminal-sessions-table';
import { Route } from '@routes/(authenticated)/$organizationSlug/t/$teamSlug/terminal/index';
import { useNavigate } from '@tanstack/react-router';
import { Download, Monitor } from 'lucide-react';
import { useState } from 'react';

export function TerminalSessionsPage() {
  const currentOrganization = useCurrentOrganization();
  const currentTeam = useCurrentTeam();
  const { page, size, status, deviceId, userId, dateFrom, dateTo } =
    Route.useSearch();
  const { teamSlug } = Route.useParams();
  const navigate = useNavigate({ from: Route.fullPath });
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);

  const { activeFilterCount, chips, clearFilters, removeFilter } =
    useTerminalFilterState();

  const organizationId = currentOrganization.id;
  const teamId = currentTeam.id;

  const { data } = useTerminalSessionsSuspenseQuery(organizationId, teamId, {
    page,
    size,
    status,
    deviceId,
    userId,
    dateFrom,
    dateTo,
  });

  const sessions = data.responseData?.results || [];
  const totalPages = data.responseData?.totalPages || 0;
  const totalResults = data.responseData?.totalResults || 0;
  const hasNext = data.responseData?.hasNext || false;
  const hasPrevious = data.responseData?.hasPrevious || false;

  const terminateMutation = useTerminateTerminalSessionMutation();

  const handlePageChange = (newPage: number) => {
    navigate({
      search: (prev) => ({ ...prev, page: newPage }),
    });
  };

  const handleSizeChange = (newSize: number) => {
    navigate({
      search: (prev) => ({ ...prev, page: 1, size: newSize }),
    });
  };

  const handleRowClick = (sessionId: number) => {
    navigate({
      to: '/$organizationSlug/t/$teamSlug/terminal/$sessionId',
      params: {
        organizationSlug: currentOrganization.slug,
        teamSlug,
        sessionId: String(sessionId),
      },
    });
  };

  const handleCloseSession = (sessionId: number) => {
    terminateMutation.mutate({
      params: {
        path: {
          organizationId,
          sessionId,
        },
      },
    });
  };

  return (
    <PageSection>
      <Box innerSpaceY="lg">
        <PageHeadingBar>
          <SectionTitle>Terminal Sessions</SectionTitle>
          <HStack gap="sm">
            <FilterPanel
              activeFilterCount={activeFilterCount}
              onClear={clearFilters}
              open={filterOpen}
              onOpenChange={setFilterOpen}
            >
              <TerminalSessionFilterControls />
            </FilterPanel>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setExportDialogOpen(true)}
            >
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </HStack>
        </PageHeadingBar>

        <SessionHistoryExportDialog
          open={exportDialogOpen}
          onOpenChange={setExportDialogOpen}
          organizationId={organizationId}
          filters={{ status, deviceId, userId, dateFrom, dateTo }}
        />

        <FilterChips
          filters={chips}
          onRemove={removeFilter}
          onClearAll={clearFilters}
        />

        {sessions.length === 0 ? (
          activeFilterCount > 0 ? (
            <EmptyState
              variant="filtered"
              ctaAction={clearFilters}
            />
          ) : (
            <EmptyState
              icon={Monitor}
              title="No terminal sessions"
              description="Open a terminal session from a device to get started."
            />
          )
        ) : (
          <>
            <DataTable>
              <TerminalSessionsTable
                sessions={sessions}
                onRowClick={handleRowClick}
                onCloseSession={handleCloseSession}
                terminateMutation={terminateMutation}
              />
            </DataTable>

            <PaginatedFooter
              totalResults={totalResults}
              singularLabel="session"
              pluralLabel="sessions"
              page={page}
              totalPages={totalPages}
              hasNext={hasNext}
              hasPrevious={hasPrevious}
              size={size}
              onPageChange={handlePageChange}
              onSizeChange={handleSizeChange}
            />
          </>
        )}
      </Box>
    </PageSection>
  );
}
