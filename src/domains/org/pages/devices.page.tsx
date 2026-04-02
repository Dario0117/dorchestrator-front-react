import { Box } from '@components/ds/atoms/box';
import { Button } from '@components/ds/atoms/button';
import { EmptyState } from '@components/ds/atoms/empty-state';
import { Grid } from '@components/ds/atoms/grid';
import { HStack } from '@components/ds/atoms/hstack';
import { PageSection } from '@components/ds/atoms/page-section';
import { PageTitle } from '@components/ds/atoms/page-title';
import { FilterChips } from '@components/ds/molecules/filter-chips';
import { FilterPanel } from '@components/ds/molecules/filter-panel';
import { PageHeadingBar } from '@components/ds/molecules/page-heading-bar';
import { PaginatedFooter } from '@components/ds/organisms/paginated-footer';
import { ExecuteCommandModal } from '@domains/commands/modals/execute-command-modal';
import { DeviceCard } from '@domains/devices/components/device-card';
import {
  DeviceFilterControls,
  useDeviceFilterState,
} from '@domains/devices/filters/device-filters';
import { useDevicesPresence } from '@domains/devices/hooks/use-devices-presence';
import { AddDeviceModal } from '@domains/devices/modals/add-device-modal';
import { DeviceConfigDialog } from '@domains/devices/modals/device-config-dialog';
import { useDevicesSuspenseQuery } from '@domains/devices/services/list-devices.http-service';
import { useRemoveDeviceMutation } from '@domains/devices/services/remove-device.http-service';
import { ConfirmDialog } from '@domains/shared/components/confirm-dialog';
import { useCurrentOrganization } from '@domains/shared/hooks/use-current-organization';
import { useCurrentTeam } from '@domains/shared/hooks/use-current-team';
import { CreateTerminalSessionDialog } from '@domains/terminal/modals/create-terminal-session-dialog';
import { TerminalReauthModal } from '@domains/terminal/modals/terminal-reauth-modal';
import { Route } from '@routes/(authenticated)/$organizationSlug/t/$teamSlug/devices';
import { useNavigate } from '@tanstack/react-router';
import { HardDrive, Plus } from 'lucide-react';
import { useMemo, useState } from 'react';

export function DevicesPage() {
  const currentOrganization = useCurrentOrganization();
  const currentTeam = useCurrentTeam();
  const { page, size, status, platform } = Route.useSearch();
  const { teamSlug } = Route.useParams();
  const navigate = useNavigate({ from: Route.fullPath });
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);

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

  const { activeFilterCount, chips, clearFilters, removeFilter } =
    useDeviceFilterState();

  const isAdmin =
    currentOrganization.role === 'admin' ||
    currentOrganization.role === 'owner';

  const organizationId = currentOrganization.id;
  const teamId = currentTeam.id;

  const { data } = useDevicesSuspenseQuery(organizationId, teamId, page, size);

  const deleteMutation = useRemoveDeviceMutation();

  const allDevices = data.responseData?.results || [];
  const totalPages = data.responseData?.totalPages || 0;
  const totalResults = data.responseData?.totalResults || 0;
  const hasNext = data.responseData?.hasNext || false;
  const hasPrevious = data.responseData?.hasPrevious || false;

  const deviceIds = useMemo(() => allDevices.map((d) => d.id), [allDevices]);
  const { presenceMap } = useDevicesPresence(deviceIds);

  const devices = useMemo(() => {
    let filtered = allDevices;
    if (status !== undefined) {
      filtered = filtered.filter((d) => {
        const online = presenceMap.get(d.id) ?? false;
        return status === 'online' ? online : !online;
      });
    }
    if (platform !== undefined) {
      filtered = filtered.filter((d) => d.platform === platform);
    }
    return filtered;
  }, [allDevices, status, platform, presenceMap]);

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
    <PageSection>
      <Box innerSpaceY="lg">
        <PageHeadingBar>
          <PageTitle>Devices</PageTitle>
          <HStack gap="sm">
            <FilterPanel
              activeFilterCount={activeFilterCount}
              onClear={clearFilters}
              open={filterOpen}
              onOpenChange={setFilterOpen}
            >
              <DeviceFilterControls />
            </FilterPanel>
            <Button onClick={() => setAddModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Device
            </Button>
          </HStack>
        </PageHeadingBar>

        <FilterChips
          filters={chips}
          onRemove={removeFilter}
          onClearAll={clearFilters}
        />

        {devices.length === 0 ? (
          activeFilterCount > 0 ? (
            <EmptyState
              variant="filtered"
              ctaAction={clearFilters}
            />
          ) : (
            <EmptyState
              icon={HardDrive}
              title="No devices yet"
              description="Get started by registering your first device."
              ctaLabel="Add Your First Device"
              ctaAction={() => setAddModalOpen(true)}
              ctaIcon={Plus}
            />
          )
        ) : (
          <>
            <Grid
              cols={3}
              gap="lg"
            >
              {devices.map((device) => (
                <DeviceCard
                  key={device.id}
                  device={device}
                  isOnline={presenceMap.get(device.id) ?? false}
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
            </Grid>

            <PaginatedFooter
              totalResults={totalResults}
              singularLabel="device"
              pluralLabel="devices"
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

        {addModalOpen && (
          <AddDeviceModal
            open={addModalOpen}
            onOpenChange={setAddModalOpen}
            organizationId={organizationId}
            teamId={teamId}
          />
        )}

        {executeCommandDevice && (
          <ExecuteCommandModal
            open={true}
            onOpenChange={() => setExecuteCommandDevice(null)}
            organizationId={organizationId}
            teamId={teamId}
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
            teamId={teamId}
            deviceId={sessionConfigDevice.id}
            deviceName={sessionConfigDevice.name}
            terminalAuthToken={sessionConfigDevice.terminalAuthToken}
            onSessionCreated={(sessionId) => {
              setSessionConfigDevice(null);
              navigate({
                to: '/$organizationSlug/t/$teamSlug/terminal/$sessionId',
                params: {
                  organizationSlug: currentOrganization.slug,
                  teamSlug,
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
                    teamId: teamId,
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
      </Box>
    </PageSection>
  );
}
