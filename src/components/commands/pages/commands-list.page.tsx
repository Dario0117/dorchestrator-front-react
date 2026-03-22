import { CommandCard } from '@components/commands/command-card';
import { CommandFilters } from '@components/commands/command-filters';
import { ExecuteCommandModal } from '@components/commands/execute-command-modal';
import { Button } from '@components/ds/atoms/button';
import { EmptyState } from '@components/ds/atoms/empty-state';
import { PageSection } from '@components/ds/atoms/page-section';
import { SectionTitle } from '@components/ds/atoms/section-title';
import { PageHeadingBar } from '@components/ds/molecules/page-heading-bar';
import { PaginatedFooter } from '@components/ds/organisms/paginated-footer';
import { useCurrentOrganization } from '@hooks/use-current-organization';
import { useCurrentTeam } from '@hooks/use-current-team';
import { Route } from '@routes/(authenticated)/$organizationSlug/t/$teamSlug/commands/index';
import { useCommandsSuspenseQuery } from '@services/commands/list-commands.http-service';
import { useNavigate } from '@tanstack/react-router';
import { Play, Search, Terminal } from 'lucide-react';
import { useEffect, useState } from 'react';

export function CommandsListPage() {
  const currentOrganization = useCurrentOrganization();
  const currentTeam = useCurrentTeam();
  const {
    page,
    size,
    executeModal,
    deviceId,
    status,
    startDate,
    endDate,
    search,
  } = Route.useSearch();
  const { teamSlug } = Route.useParams();
  const navigate = useNavigate({ from: Route.fullPath });

  const [modalOpen, setModalOpen] = useState(false);

  const organizationId = currentOrganization.id;
  // biome-ignore lint/style/noNonNullAssertion: Team is always defined in team-scoped routes (validated in route loader)
  const teamId = currentTeam!.id;

  const { data } = useCommandsSuspenseQuery(organizationId, teamId, {
    page,
    size,
    deviceId,
    status,
    startDate,
    endDate,
    search,
  });

  const commands = data.responseData?.results || [];
  const totalPages = data.responseData?.totalPages || 0;
  const totalResults = data.responseData?.totalResults || 0;
  const hasNext = data.responseData?.hasNext || false;
  const hasPrevious = data.responseData?.hasPrevious || false;
  const hasActiveFilters =
    deviceId !== undefined ||
    status !== undefined ||
    startDate !== undefined ||
    endDate !== undefined ||
    search !== undefined;

  useEffect(() => {
    if (executeModal === 'open') {
      setModalOpen(true);
    }
  }, [executeModal]);

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

  const handleModalChange = (open: boolean) => {
    setModalOpen(open);
    if (!open && executeModal === 'open') {
      navigate({
        search: (prev) => ({
          ...prev,
          executeModal: undefined,
        }),
      });
    }
  };

  return (
    <PageSection>
      <div className="py-6">
        <PageHeadingBar>
          <SectionTitle>Command History</SectionTitle>
          <Button
            className="w-full md:w-auto"
            onClick={() => setModalOpen(true)}
          >
            <Play className="mr-2 h-4 w-4" />
            Execute New Command
          </Button>
        </PageHeadingBar>

        <CommandFilters />

        {commands.length === 0 ? (
          hasActiveFilters ? (
            <EmptyState
              icon={Search}
              title="No commands match your filters"
              description="Try adjusting your search criteria."
              action={
                <Button
                  variant="outline"
                  onClick={() =>
                    navigate({
                      search: (prev) => ({ page: 1, size: prev.size }),
                    })
                  }
                >
                  Clear Filters
                </Button>
              }
            />
          ) : (
            <EmptyState
              icon={Terminal}
              title="No commands executed yet"
              description="Click 'Execute New Command' to get started."
              action={
                <Button onClick={() => setModalOpen(true)}>
                  <Play className="mr-2 h-4 w-4" />
                  Execute New Command
                </Button>
              }
            />
          )
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {commands.map((command) => (
                <CommandCard
                  key={command.id}
                  command={command}
                  onClick={() =>
                    navigate({
                      to: '/$organizationSlug/t/$teamSlug/commands/$commandId',
                      params: {
                        organizationSlug: currentOrganization.slug,
                        teamSlug,
                        commandId: String(command.id),
                      },
                    })
                  }
                />
              ))}
            </div>

            <PaginatedFooter
              totalResults={totalResults}
              singularLabel="result"
              pluralLabel="results"
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

        {modalOpen && (
          <ExecuteCommandModal
            open={modalOpen}
            onOpenChange={handleModalChange}
            organizationId={organizationId}
            teamId={teamId}
          />
        )}
      </div>
    </PageSection>
  );
}
