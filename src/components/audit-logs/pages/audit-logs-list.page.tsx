import { AuditLogFilters } from '@components/audit-logs/audit-log-filters';
import { AuditLogRow } from '@components/audit-logs/audit-log-row';
import { Button } from '@components/ui/button';
import { EmptyState } from '@components/ui/empty-state';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@components/ui/pagination';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/ui/select';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@components/ui/table';
import { useCurrentOrganization } from '@hooks/use-current-organization';
import { PAGE_SIZE_OPTIONS } from '@lib/pagination.constants';
import { Route } from '@routes/(authenticated)/$organizationSlug/audit-logs/index';
import { useAuditLogsSuspenseQuery } from '@services/audit-logs/list-audit-logs.http-service';
import { useNavigate } from '@tanstack/react-router';
import { ScrollText, Search } from 'lucide-react';

export function AuditLogsListPage() {
  const currentOrganization = useCurrentOrganization();
  const { page, size, action, resourceType, fromDate, toDate } =
    Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });

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
  const hasActiveFilters =
    action !== undefined ||
    resourceType !== undefined ||
    fromDate !== undefined ||
    toDate !== undefined;

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

  return (
    <section className="p-6 md:p-10 space-y-6">
      <div className="py-6">
        <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <h1 className="text-2xl font-semibold">Audit Logs</h1>
        </div>

        <AuditLogFilters />

        {entries.length === 0 ? (
          hasActiveFilters ? (
            <EmptyState
              icon={Search}
              title="No audit logs match your filters"
              description="Use the filters above to adjust your search."
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
              icon={ScrollText}
              title="No audit logs yet"
              description="Activity will appear here as actions are performed in your organization."
            />
          )
        ) : (
          <>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Resource</TableHead>
                    <TableHead>Team</TableHead>
                    <TableHead>Actor</TableHead>
                    <TableHead>Resource ID</TableHead>
                    <TableHead>Request ID</TableHead>
                    <TableHead className="w-[40px]" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entries.map((entry) => (
                    <AuditLogRow
                      key={entry.id}
                      entry={entry}
                    />
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="mt-8 flex flex-col items-center gap-4 md:flex-row md:justify-between">
              <span className="text-sm text-muted-foreground">
                {totalResults} total {totalResults === 1 ? 'entry' : 'entries'}
              </span>

              <div className="flex flex-col items-center gap-4 md:flex-row">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => handlePageChange(page - 1)}
                        aria-disabled={!hasPrevious}
                        disabled={!hasPrevious}
                      />
                    </PaginationItem>

                    <PaginationItem>
                      <output className="px-2 text-sm">
                        Page {page} of {totalPages}
                      </output>
                    </PaginationItem>

                    <PaginationItem>
                      <PaginationNext
                        onClick={() => handlePageChange(page + 1)}
                        aria-disabled={!hasNext}
                        disabled={!hasNext}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>

                <Select
                  value={String(size)}
                  onValueChange={(value) => handleSizeChange(Number(value))}
                >
                  <SelectTrigger
                    aria-label="Page size"
                    className="h-11 w-auto text-base md:text-sm"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PAGE_SIZE_OPTIONS.map((option) => (
                      <SelectItem
                        key={option}
                        value={String(option)}
                      >
                        {option} per page
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
