import { ConfirmDialog } from '@components/confirm-dialog';
import { AddDeviceModal } from '@components/devices/add-device-modal';
import { DeviceCard } from '@components/devices/device-card';
import { Button } from '@components/ui/button';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@components/ui/pagination';
import { Route } from '@routes/(authenticated)/$organizationSlug/devices';
import { useDevicesQuery } from '@services/devices/list-devices.http-service';
import { useRemoveDeviceMutation } from '@services/devices/remove-device.http-service';
import { useOrganizationStore } from '@stores/organization.store';
import { useNavigate } from '@tanstack/react-router';
import { Plus } from 'lucide-react';
import { useState } from 'react';

export function DevicesPage() {
  const { currentOrganization } = useOrganizationStore();
  const { page, size } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{
    id: number;
    name: string;
  } | null>(null);

  const organizationId = currentOrganization.id;

  // Fetch devices
  const { data, isLoading, error } = useDevicesQuery(
    organizationId,
    page,
    size,
  );

  // Delete device mutation
  const deleteMutation = useRemoveDeviceMutation();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!data || error) {
    return <div>Error loading devices</div>;
  }

  const devices = data.responseData?.results || [];
  const totalPages = data.responseData?.totalPages || 0;
  const hasNext = data.responseData?.hasNext || false;
  const hasPrevious = data.responseData?.hasPrevious || false;

  const handlePageChange = (newPage: number) => {
    navigate({
      search: (prev) => ({ ...prev, page: newPage }),
    });
  };

  return (
    <section className="p-6 md:p-10 space-y-6">
      <div className="py-6">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Devices</h1>
          <Button onClick={() => setAddModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Device
          </Button>
        </div>

        {devices.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
            <p className="text-muted-foreground">
              No devices registered yet. Click "Add Device" to get started.
            </p>
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {devices.map((device) => (
                <DeviceCard
                  key={device.id}
                  device={device}
                  onRemove={(id) =>
                    setConfirmDelete({ id, name: device.deviceName })
                  }
                  onExecuteCommand={(id) => {
                    // TODO: Navigate to command submission page
                    console.log('Execute command for device:', id);
                  }}
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

        {addModalOpen && (
          <AddDeviceModal
            open={addModalOpen}
            onOpenChange={setAddModalOpen}
            organizationId={organizationId}
          />
        )}

        {confirmDelete && (
          <ConfirmDialog
            open={!!confirmDelete}
            onOpenChange={(open) => !open && setConfirmDelete(null)}
            title="Remove Device"
            desc={`Are you sure you want to remove ${confirmDelete.name}? This action cannot be undone.`}
            handleConfirm={() => {
              deleteMutation.mutate({
                params: {
                  path: {
                    organizationId: organizationId,
                    deviceId: confirmDelete.id,
                  },
                },
              });
              setConfirmDelete(null);
            }}
            confirmText="Remove"
            destructive
          />
        )}
      </div>
    </section>
  );
}
