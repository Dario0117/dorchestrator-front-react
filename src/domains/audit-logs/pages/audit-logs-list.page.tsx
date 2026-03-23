import { Box } from '@components/ds/atoms/box';
import { EmptyState } from '@components/ds/atoms/empty-state';
import { PageSection } from '@components/ds/atoms/page-section';
import { SectionTitle } from '@components/ds/atoms/section-title';
import { PageHeadingBar } from '@components/ds/molecules/page-heading-bar';
import { FilteredDataTable } from '@components/ds/organisms/filtered-data-table';
import { PaginatedFooter } from '@components/ds/organisms/paginated-footer';
import { AuditLogFilters } from '@domains/audit-logs/filters/audit-log-filters';
import { useAuditLogActiveFilterCount } from '@domains/audit-logs/hooks/use-audit-log-active-filter-count';
import { useAuditLogsSuspenseQuery } from '@domains/audit-logs/services/list-audit-logs.http-service';
import { AuditLogsTable } from '@domains/audit-logs/tables/audit-logs-table';
import { useCurrentOrganization } from '@domains/shared/hooks/use-current-organization';
import { Route } from '@routes/(authenticated)/$organizationSlug/audit-logs/index';
import { useNavigate } from '@tanstack/react-router';
import { ScrollText } from 'lucide-react';

export function AuditLogsListPage() {
  const currentOrganization = useCurrentOrganization();
  const { page, size, action, resourceType, fromDate, toDate } =
    Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const activeFilterCount = useAuditLogActiveFilterCount();

  const organizationId = currentOrganization.id;

  const { data } = useAuditLogsSuspenseQuery(organizationId, {
    page,
    size,
    action,
    resourceType,
    fromDate,
    toDate,
  });

  const entries = data.responseData?.results || [];
  const totalPages = data.responseData?.totalPages || 0;
  const totalResults = data.responseData?.totalResults || 0;
  const hasNext = data.responseData?.hasNext || false;
  const hasPrevious = data.responseData?.hasPrevious || false;

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

  const handleClearFilters = () => {
    navigate({
      search: (prev) => ({ page: 1, size: prev.size }),
    });
  };

  return (
    <PageSection>
      <Box innerSpaceY="lg">
        <PageHeadingBar>
          <SectionTitle>Audit Logs</SectionTitle>
        </PageHeadingBar>

        <FilteredDataTable
          filters={<AuditLogFilters />}
          activeFilterCount={activeFilterCount}
          onClearFilters={handleClearFilters}
          isEmpty={entries.length === 0}
          filteredEmptyState={
            <EmptyState
              variant="filtered"
              ctaAction={handleClearFilters}
            />
          }
          defaultEmptyState={
            <EmptyState
              icon={ScrollText}
              title="No audit logs"
              description="Activity will appear here as actions are performed in your organization."
            />
          }
          footer={
            <PaginatedFooter
              totalResults={totalResults}
              singularLabel="entry"
              pluralLabel="entries"
              page={page}
              totalPages={totalPages}
              hasNext={hasNext}
              hasPrevious={hasPrevious}
              size={size}
              onPageChange={handlePageChange}
              onSizeChange={handleSizeChange}
            />
          }
        >
          <AuditLogsTable entries={entries} />
        </FilteredDataTable>
      </Box>
    </PageSection>
  );
}
