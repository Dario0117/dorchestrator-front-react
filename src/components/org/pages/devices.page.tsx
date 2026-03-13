import { ExecuteCommandModal } from '@components/commands/execute-command-modal';
import { ConfirmDialog } from '@components/confirm-dialog';
import { AddDeviceModal } from '@components/devices/add-device-modal';
import { DeviceCard } from '@components/devices/device-card';
import { DeviceConfigDialog } from '@components/devices/device-config-dialog';
import { CreateTerminalSessionDialog } from '@components/terminal/create-terminal-session-dialog';
import { TerminalReauthModal } from '@components/terminal/terminal-reauth-modal';
import { Button } from '@components/ui/button';
import { EmptyState } from '@components/ui/empty-state';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@components/ui/pagination';
import { useCurrentOrganization } from '@hooks/use-current-organization';
import { Route } from '@routes/(authenticated)/$organizationSlug/devices';
import { useDevicesSuspenseQuery } from '@services/devices/list-devices.http-service';
import { useRemoveDeviceMutation } from '@services/devices/remove-device.http-service';
import { useNavigate } from '@tanstack/react-router';
import { HardDrive, Plus } from 'lucide-react';
import { useState } from 'react';

export function DevicesPage() {
  const currentOrganization = useCurrentOrganization();
  const { page, size } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [executeCommandDevice, setExecuteCommandDevice] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [terminalDevice, setTerminalDevice] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [sessionConfigDevice, setSessionConfigDevice] = useState<{
    id: number;
    name: string;
    terminalAuthToken: string;
  } | null>(null);
  const [configDevice, setConfigDevice] = useState<{
    id: number;
    name: string;
  } | null>(null);

  const isAdmin =
    currentOrganization.role === 'admin' ||
    currentOrganization.role === 'owner';

  const organizationId = currentOrganization.id;

  // Fetch devices (pre-loaded by route loader)
  const { data } = useDevicesSuspenseQuery(organizationId, page, size);

  // Delete device mutation
  const deleteMutation = useRemoveDeviceMutation();

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
          <h1 className="text-3xl font-bold font-serif">Devices</h1>
          <Button onClick={() => setAddModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Device
          </Button>
        </div>

        {devices.length === 0 ? (
          <EmptyState
            icon={HardDrive}
            title="No devices registered"
            description='No devices registered yet. Click "Add Device" to get started.'
            action={
              <Button onClick={() => setAddModalOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Device
              </Button>
            }
          />
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
                  onExecuteCommand={() => {
                    setExecuteCommandDevice({
                      id: device.id,
                      name: device.deviceName,
                    });
                  }}
                  onOpenTerminal={() => {
                    setTerminalDevice({
                      id: device.id,
                      name: device.deviceName,
                    });
                  }}
                  onConfigure={
                    isAdmin
                      ? () =>
                          setConfigDevice({
                            id: device.id,
                            name: device.deviceName,
                          })
                      : undefined
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

        {addModalOpen && (
          <AddDeviceModal
            open={addModalOpen}
            onOpenChange={setAddModalOpen}
            organizationId={organizationId}
          />
        )}

        {executeCommandDevice && (
          <ExecuteCommandModal
            open={true}
            onOpenChange={() => setExecuteCommandDevice(null)}
            organizationId={organizationId}
            pinnedDevice={executeCommandDevice}
          />
        )}

        {terminalDevice && (
          <TerminalReauthModal
            open={true}
            onOpenChange={() => setTerminalDevice(null)}
            organizationId={organizationId}
            onSuccess={(terminalAuthToken) => {
              setSessionConfigDevice({
                id: terminalDevice.id,
                name: terminalDevice.name,
                terminalAuthToken,
              });
              setTerminalDevice(null);
            }}
          />
        )}

        {sessionConfigDevice && (
          <CreateTerminalSessionDialog
            open={true}
            onOpenChange={() => setSessionConfigDevice(null)}
            organizationId={organizationId}
            deviceId={sessionConfigDevice.id}
            deviceName={sessionConfigDevice.name}
            terminalAuthToken={sessionConfigDevice.terminalAuthToken}
            onSessionCreated={(sessionId) => {
              setSessionConfigDevice(null);
              navigate({
                to: '/$organizationSlug/terminal/$sessionId',
                params: {
                  organizationSlug: currentOrganization.slug,
                  sessionId: String(sessionId),
                },
              });
            }}
          />
        )}

        {configDevice && (
          <DeviceConfigDialog
            open={true}
            onOpenChange={() => setConfigDevice(null)}
            organizationId={organizationId}
            deviceId={configDevice.id}
            deviceName={configDevice.name}
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
