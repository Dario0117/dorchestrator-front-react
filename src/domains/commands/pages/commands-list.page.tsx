import { Box } from '@components/ds/atoms/box';
import { Button } from '@components/ds/atoms/button';
import { EmptyState } from '@components/ds/atoms/empty-state';
import { Grid } from '@components/ds/atoms/grid';
import { PageSection } from '@components/ds/atoms/page-section';
import { SectionTitle } from '@components/ds/atoms/section-title';
import { PageHeadingBar } from '@components/ds/molecules/page-heading-bar';
import { PaginatedFooter } from '@components/ds/organisms/paginated-footer';
import { CommandCard } from '@domains/commands/components/command-card';
import { CommandFilters } from '@domains/commands/filters/command-filters';
import { ExecuteCommandModal } from '@domains/commands/modals/execute-command-modal';
import { useCommandsSuspenseQuery } from '@domains/commands/services/list-commands.http-service';
import { useCurrentOrganization } from '@domains/shared/hooks/use-current-organization';
import { useCurrentTeam } from '@domains/shared/hooks/use-current-team';
import { Route } from '@routes/(authenticated)/$organizationSlug/t/$teamSlug/commands/index';
import { useNavigate } from '@tanstack/react-router';
import { Play, Terminal } from 'lucide-react';
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
      <Box innerSpaceY="lg">
        <PageHeadingBar>
          <SectionTitle>Command History</SectionTitle>
          <Button onClick={() => setModalOpen(true)}>
            <Play className="mr-2 h-4 w-4" />
            Execute New Command
          </Button>
        </PageHeadingBar>

        <CommandFilters />

        {commands.length === 0 ? (
          hasActiveFilters ? (
            <EmptyState
              variant="filtered"
              ctaAction={() =>
                navigate({
                  search: (prev) => ({ page: 1, size: prev.size }),
                })
              }
            />
          ) : (
            <EmptyState
              icon={Terminal}
              title="No commands yet"
              description="Execute your first command to get started."
              ctaLabel="Execute Command"
              ctaAction={() => setModalOpen(true)}
              ctaIcon={Play}
            />
          )
        ) : (
          <>
            <Grid
              cols={2}
              gap="lg"
            >
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
            </Grid>

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
      </Box>
    </PageSection>
  );
}
