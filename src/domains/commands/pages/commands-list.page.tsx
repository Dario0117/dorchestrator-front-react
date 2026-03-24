import { Box } from '@components/ds/atoms/box';
import { Button } from '@components/ds/atoms/button';
import { EmptyState } from '@components/ds/atoms/empty-state';
import { Grid } from '@components/ds/atoms/grid';
import { HStack } from '@components/ds/atoms/hstack';
import { PageSection } from '@components/ds/atoms/page-section';
import { SectionTitle } from '@components/ds/atoms/section-title';
import { FilterChips } from '@components/ds/molecules/filter-chips';
import { FilterPanel } from '@components/ds/molecules/filter-panel';
import { PageHeadingBar } from '@components/ds/molecules/page-heading-bar';
import { PaginatedFooter } from '@components/ds/organisms/paginated-footer';
import { CommandCard } from '@domains/commands/components/command-card';
import {
  CommandFilterControls,
  CommandSearchInput,
} from '@domains/commands/filters/command-filters';
import { useCommandFilterState } from '@domains/commands/hooks/use-command-filter-state';
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
  const [filterOpen, setFilterOpen] = useState(false);

  const { activeFilterCount, chips, clearFilters, removeFilter } =
    useCommandFilterState();

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
          <HStack gap="sm">
            <CommandSearchInput />
            <FilterPanel
              activeFilterCount={activeFilterCount}
              onClear={clearFilters}
              open={filterOpen}
              onOpenChange={setFilterOpen}
            >
              <CommandFilterControls />
            </FilterPanel>
            <Button onClick={() => setModalOpen(true)}>
              <Play className="mr-2 h-4 w-4" />
              Execute New Command
            </Button>
          </HStack>
        </PageHeadingBar>

        <FilterChips
          filters={chips}
          onRemove={removeFilter}
          onClearAll={clearFilters}
        />

        {commands.length === 0 ? (
          activeFilterCount > 0 ? (
            <EmptyState
              variant="filtered"
              ctaAction={clearFilters}
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
