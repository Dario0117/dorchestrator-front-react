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
import { Badge } from '@components/ui/badge';
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
import { Skeleton } from '@components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@components/ui/table';
import { useCurrentOrganization } from '@hooks/use-current-organization';
import { badgeStyles } from '@lib/badge-styles';
import { formatRelativeTime } from '@lib/format-relative-time';
import { PAGE_SIZE_OPTIONS } from '@lib/pagination.constants';
import { Route } from '@routes/(authenticated)/$organizationSlug/terminal/index';
import type { TerminalSessionListItem } from '@services/terminal/list-terminal-sessions.http-service';
import { useTerminalSessionsSuspenseQuery } from '@services/terminal/list-terminal-sessions.http-service';
import { useTerminateTerminalSessionMutation } from '@services/terminal/terminate-terminal-session.http-service';
import { useNavigate } from '@tanstack/react-router';
import { Monitor, X } from 'lucide-react';

const STATUS_BADGE_STYLES = {
  active: badgeStyles.green,
  created: badgeStyles.blue,
  locked: badgeStyles.yellow,
  terminated: badgeStyles.gray,
} as const;

function StatusBadge({
  status,
}: {
  status: TerminalSessionListItem['status'];
}) {
  return (
    <Badge
      variant="outline"
      className={STATUS_BADGE_STYLES[status]}
    >
      {status}
    </Badge>
  );
}

function SessionTableSkeleton() {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Device</TableHead>
            <TableHead>Owner</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Last Activity</TableHead>
            <TableHead className="w-12" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {['sk-1', 'sk-2', 'sk-3', 'sk-4', 'sk-5'].map((id) => (
            <TableRow key={id}>
              <TableCell>
                <Skeleton className="h-4 w-28" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-20" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-16" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-16" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-16" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-8 w-8" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export function TerminalSessionsPage() {
  const currentOrganization = useCurrentOrganization();
  const { page, size, status } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });

  const organizationId = currentOrganization.id;

  const { data } = useTerminalSessionsSuspenseQuery(organizationId, {
    page,
    size,
    status,
  });

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

  const terminateMutation = useTerminateTerminalSessionMutation();

  const handleRowClick = (sessionId: number) => {
    navigate({
      to: '/$organizationSlug/terminal/$sessionId',
      params: {
        organizationSlug: currentOrganization.slug,
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
    <section className="p-6 md:p-10 space-y-6">
      <div className="py-6">
        <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <h1 className="text-2xl font-bold font-serif">Terminal Sessions</h1>
        </div>

        <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center">
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
        </div>

        {sessions.length === 0 ? (
          status !== undefined ? (
            <EmptyState
              icon={Monitor}
              title="No sessions match your filter"
              description="Try a different status filter to find sessions."
              action={
                <Button
                  variant="outline"
                  onClick={() =>
                    navigate({
                      search: (prev) => ({
                        page: 1,
                        size: prev.size,
                      }),
                    })
                  }
                >
                  Clear Filter
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
                    <TableHead>Device</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Last Activity</TableHead>
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
                      <TableCell className="font-medium">
                        {session.deviceName}
                      </TableCell>
                      <TableCell>{session.userName}</TableCell>
                      <TableCell>
                        <StatusBadge status={session.status} />
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

export { SessionTableSkeleton };
