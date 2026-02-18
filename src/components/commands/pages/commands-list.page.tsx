import { CommandCard } from '@components/commands/command-card';
import { ExecuteCommandModal } from '@components/commands/execute-command-modal';
import { Button } from '@components/ui/button';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@components/ui/pagination';
import { useCurrentOrganization } from '@hooks/use-current-organization';
import { Route } from '@routes/(authenticated)/$organizationSlug/commands/index';
import { useCommandsSuspenseQuery } from '@services/commands/list-commands.http-service';
import { useNavigate } from '@tanstack/react-router';
import { Play } from 'lucide-react';
import { useEffect, useState } from 'react';

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const;

export function CommandsListPage() {
  const currentOrganization = useCurrentOrganization();
  const { page, size, executeModal } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });

  const [modalOpen, setModalOpen] = useState(false);

  const organizationId = currentOrganization.id;

  const { data } = useCommandsSuspenseQuery(organizationId, page, size);

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
    <section className="p-6 md:p-10 space-y-6">
      <div className="py-6">
        <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <h1 className="text-2xl font-bold">Command History</h1>
          <Button
            className="w-full md:w-auto"
            onClick={() => setModalOpen(true)}
          >
            <Play className="mr-2 h-4 w-4" />
            Execute New Command
          </Button>
        </div>

        {commands.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
            <p className="text-muted-foreground">
              No commands executed yet. Click &apos;Execute New Command&apos; to
              get started.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {commands.map((command) => (
                <CommandCard
                  key={command.id}
                  command={command}
                  onClick={() =>
                    navigate({
                      to: '/$organizationSlug/commands/$commandId',
                      params: {
                        organizationSlug: currentOrganization.slug,
                        commandId: String(command.id),
                      },
                    })
                  }
                />
              ))}
            </div>

            <div className="mt-8 flex flex-col items-center gap-4 md:flex-row md:justify-between">
              <span className="text-sm text-muted-foreground">
                {totalResults} total {totalResults === 1 ? 'result' : 'results'}
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

                <select
                  value={size}
                  onChange={(e) => handleSizeChange(Number(e.target.value))}
                  aria-label="Page size"
                  className="h-11 rounded-md border bg-background px-3 text-base md:text-sm"
                >
                  {PAGE_SIZE_OPTIONS.map((option) => (
                    <option
                      key={option}
                      value={option}
                    >
                      {option} per page
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </>
        )}

        {modalOpen && (
          <ExecuteCommandModal
            open={modalOpen}
            onOpenChange={handleModalChange}
            organizationId={organizationId}
          />
        )}
      </div>
    </section>
  );
}
