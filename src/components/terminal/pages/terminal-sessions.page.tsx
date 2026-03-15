import { SessionStatusBadge } from '@components/terminal/pages/session-status-badge';
import { SessionHistoryExportDialog } from '@components/terminal/session-history-export-dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@components/ui/alert-dialog';
import { Button } from '@components/ui/button';
import { EmptyState } from '@components/ui/empty-state';
import { Input } from '@components/ui/input';
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
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@components/ui/table';
import { useCurrentOrganization } from '@hooks/use-current-organization';
import { useCurrentTeam } from '@hooks/use-current-team';
import { formatBytes } from '@lib/format-bytes';
import { formatDurationCompact } from '@lib/format-duration';
import { formatRelativeTime } from '@lib/format-relative-time';
import { PAGE_SIZE_OPTIONS } from '@lib/pagination.constants';
import { Route } from '@routes/(authenticated)/$organizationSlug/t/$teamSlug/terminal/index';
import { useDevicesQueryOptions } from '@services/devices/list-devices.http-service';
import { useListMembersQueryOptions } from '@services/organizations/list-members.http-service';
import { useTerminalSessionsSuspenseQuery } from '@services/terminal/list-terminal-sessions.http-service';
import { useTerminateTerminalSessionMutation } from '@services/terminal/terminate-terminal-session.http-service';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { Download, Monitor, X } from 'lucide-react';
import { useState } from 'react';

export function TerminalSessionsPage() {
  const currentOrganization = useCurrentOrganization();
  const currentTeam = useCurrentTeam();
  const { page, size, status, deviceId, userId, dateFrom, dateTo } =
    Route.useSearch();
  const { teamSlug } = Route.useParams();
  const navigate = useNavigate({ from: Route.fullPath });
  const [exportDialogOpen, setExportDialogOpen] = useState(false);

  const organizationId = currentOrganization.id;
  // biome-ignore lint/style/noNonNullAssertion: Team is always defined in team-scoped routes (validated in route loader)
  const teamId = currentTeam!.id;

  const { data } = useTerminalSessionsSuspenseQuery(organizationId, teamId, {
    page,
    size,
    status,
    deviceId,
    userId,
    dateFrom,
    dateTo,
  });

  const { data: devicesData } = useQuery(
    useDevicesQueryOptions(organizationId, teamId, 1, 100),
  );
  const { data: membersData } = useQuery(
    useListMembersQueryOptions(organizationId, { page: 1, size: 100 }),
  );

  const devices = devicesData?.responseData?.results ?? [];
  const members = membersData?.responseData?.results ?? [];

  const sessions = data.responseData?.results || [];
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

  const handleStatusFilter = (newStatus: string) => {
    navigate({
      search: (prev) => ({
        ...prev,
        page: 1,
        status: newStatus === 'all' ? undefined : newStatus,
      }),
    });
  };

  const handleDeviceFilter = (value: string) => {
    navigate({
      search: (prev) => ({
        ...prev,
        page: 1,
        deviceId: value === 'all' ? undefined : Number(value),
      }),
    });
  };

  const handleUserFilter = (value: string) => {
    navigate({
      search: (prev) => ({
        ...prev,
        page: 1,
        userId: value === 'all' ? undefined : value,
      }),
    });
  };

  const handleDateFromFilter = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    navigate({
      search: (prev) => ({
        ...prev,
        page: 1,
        dateFrom: value ? `${value}T00:00:00.000Z` : undefined,
      }),
    });
  };

  const handleDateToFilter = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    navigate({
      search: (prev) => ({
        ...prev,
        page: 1,
        dateTo: value ? `${value}T23:59:59.999Z` : undefined,
      }),
    });
  };

  const handleClearFilters = () => {
    navigate({
      search: { page: 1, size },
    });
  };

  const terminateMutation = useTerminateTerminalSessionMutation();

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

  const hasActiveFilters =
    status !== undefined ||
    deviceId !== undefined ||
    userId !== undefined ||
    dateFrom !== undefined ||
    dateTo !== undefined;

  return (
    <section className="p-6 md:p-10 space-y-6">
      <div className="py-6">
        <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <h1 className="text-2xl font-bold font-serif">Terminal Sessions</h1>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setExportDialogOpen(true)}
          >
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>

        <SessionHistoryExportDialog
          open={exportDialogOpen}
          onOpenChange={setExportDialogOpen}
          organizationId={organizationId}
          filters={{ status, deviceId, userId, dateFrom, dateTo }}
        />

        <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:flex-wrap">
          <Select
            value={status ?? 'all'}
            onValueChange={handleStatusFilter}
          >
            <SelectTrigger
              aria-label="Filter by status"
              className="h-11 w-auto text-base md:text-sm"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="created">Created</SelectItem>
              <SelectItem value="locked">Locked</SelectItem>
              <SelectItem value="terminated">Terminated</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={deviceId !== undefined ? String(deviceId) : 'all'}
            onValueChange={handleDeviceFilter}
          >
            <SelectTrigger
              aria-label="Filter by device"
              className="h-11 w-auto text-base md:text-sm"
            >
              <SelectValue placeholder="All devices" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All devices</SelectItem>
              {devices.map((device) => (
                <SelectItem
                  key={device.id}
                  value={String(device.id)}
                >
                  {device.deviceName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={userId ?? 'all'}
            onValueChange={handleUserFilter}
          >
            <SelectTrigger
              aria-label="Filter by user"
              className="h-11 w-auto text-base md:text-sm"
            >
              <SelectValue placeholder="All users" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All users</SelectItem>
              {members.map((member) => (
                <SelectItem
                  key={member.userId}
                  value={member.userId}
                >
                  {member.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            type="date"
            aria-label="From date"
            value={dateFrom?.slice(0, 10) ?? ''}
            onChange={handleDateFromFilter}
            className="h-11 w-auto text-base md:text-sm"
            placeholder="From"
          />

          <Input
            type="date"
            aria-label="To date"
            value={dateTo?.slice(0, 10) ?? ''}
            onChange={handleDateToFilter}
            className="h-11 w-auto text-base md:text-sm"
            placeholder="To"
          />

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              className="h-11 text-base md:text-sm"
              onClick={handleClearFilters}
            >
              Clear filters
            </Button>
          )}
        </div>

        {sessions.length === 0 ? (
          hasActiveFilters ? (
            <EmptyState
              icon={Monitor}
              title="No sessions match your filters"
              description="Try adjusting your filters to find sessions."
              action={
                <Button
                  variant="outline"
                  onClick={handleClearFilters}
                >
                  Clear Filters
                </Button>
              }
            />
          ) : (
            <EmptyState
              icon={Monitor}
              title="No terminal sessions"
              description="Terminal sessions will appear here when created from a device."
            />
          )
        ) : (
          <>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Device</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Last Activity</TableHead>
                    <TableHead>Terminated</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Recording</TableHead>
                    <TableHead className="w-12" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sessions.map((session) => (
                    <TableRow
                      key={session.id}
                      className="cursor-pointer"
                      onClick={() => handleRowClick(session.id)}
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleRowClick(session.id);
                        }
                      }}
                    >
                      <TableCell>
                        <div>
                          <div className="font-medium">{session.userName}</div>
                          <div className="text-xs text-muted-foreground">
                            {session.userEmail}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {session.deviceName}
                      </TableCell>
                      <TableCell>
                        <SessionStatusBadge status={session.status} />
                      </TableCell>
                      <TableCell>
                        {session.createdAt
                          ? formatRelativeTime(session.createdAt)
                          : 'Never'}
                      </TableCell>
                      <TableCell>
                        {session.lastActivityAt
                          ? formatRelativeTime(session.lastActivityAt)
                          : 'Never'}
                      </TableCell>
                      <TableCell>
                        {session.terminatedAt
                          ? formatRelativeTime(session.terminatedAt)
                          : '—'}
                      </TableCell>
                      <TableCell>
                        {formatDurationCompact(session.durationSeconds * 1000)}
                      </TableCell>
                      <TableCell>
                        {formatBytes(session.recordingSizeBytes)}
                      </TableCell>
                      <TableCell>
                        {session.status !== 'terminated' && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                disabled={
                                  terminateMutation.isPending &&
                                  terminateMutation.variables?.params?.path
                                    ?.sessionId === session.id
                                }
                                onClick={(e) => e.stopPropagation()}
                                onKeyDown={(e) => e.stopPropagation()}
                              >
                                <X className="h-4 w-4" />
                                <span className="sr-only">Close session</span>
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent
                              onClick={(e) => e.stopPropagation()}
                            >
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Close terminal session?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will terminate the session on{' '}
                                  {session.deviceName}. This action cannot be
                                  undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleCloseSession(session.id)}
                                >
                                  Close Session
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="mt-8 flex flex-col items-center gap-4 md:flex-row md:justify-between">
              <span className="text-sm text-muted-foreground">
                {totalResults} total{' '}
                {totalResults === 1 ? 'session' : 'sessions'}
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
