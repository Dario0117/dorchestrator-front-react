import { CommandCard } from '@components/commands/command-card';
import { ExecuteCommandModal } from '@components/commands/execute-command-modal';
import { Button } from '@components/ui/button';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@components/ui/pagination';
import { useCurrentOrganization } from '@hooks/use-current-organization';
import { Route } from '@routes/(authenticated)/$organizationSlug/commands/index';
import { useCommandsSuspenseQuery } from '@services/commands/list-commands.http-service';
import { useNavigate } from '@tanstack/react-router';
import { Play } from 'lucide-react';
import { useEffect, useState } from 'react';

export function CommandsListPage() {
  const currentOrganization = useCurrentOrganization();
  const { page, size, executeModal } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });

  const [modalOpen, setModalOpen] = useState(false);

  const organizationId = currentOrganization.id;

  const { data } = useCommandsSuspenseQuery(organizationId, page, size);

  const commands = data.responseData?.results || [];
  const totalPages = data.responseData?.totalPages || 0;
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
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Commands</h1>
          <Button onClick={() => setModalOpen(true)}>
            <Play className="mr-2 h-4 w-4" />
            Execute Command
          </Button>
        </div>

        {commands.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
            <p className="text-muted-foreground">
              No commands submitted yet. Click "Execute Command" to get started.
            </p>
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
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

            {totalPages > 1 && (
              <div className="mt-8">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => handlePageChange(page - 1)}
                        aria-disabled={!hasPrevious}
                        disabled={!hasPrevious}
                      />
                    </PaginationItem>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (pageNum) => (
                        <PaginationItem key={pageNum}>
                          <PaginationLink
                            onClick={() => handlePageChange(pageNum)}
                            isActive={pageNum === page}
                          >
                            {pageNum}
                          </PaginationLink>
                        </PaginationItem>
                      ),
                    )}

                    <PaginationItem>
                      <PaginationNext
                        onClick={() => handlePageChange(page + 1)}
                        aria-disabled={!hasNext}
                        disabled={!hasNext}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
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
