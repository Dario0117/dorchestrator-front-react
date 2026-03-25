import { Box } from '@components/ds/atoms/box';
import { Button } from '@components/ds/atoms/button';
import { EmptyState } from '@components/ds/atoms/empty-state';
import { PageSection } from '@components/ds/atoms/page-section';
import { PageTitle } from '@components/ds/atoms/page-title';
import { SecondaryText } from '@components/ds/atoms/secondary-text';
import { Stack } from '@components/ds/atoms/stack';
import { PageHeadingBar } from '@components/ds/molecules/page-heading-bar';
import {
  DashboardDeviceGrid,
  isDeviceOnline,
} from '@domains/devices/components/dashboard-device-grid';
import { useDevicesSuspenseQuery } from '@domains/devices/services/list-devices.http-service';
import { useOrganizationStatsSuspenseQuery } from '@domains/org/services/organizations/get-organization-stats.http-service';
import { StatCards } from '@domains/shared/components/stat-cards';
import { useCurrentOrganization } from '@domains/shared/hooks/use-current-organization';
import { useCurrentTeam } from '@domains/shared/hooks/use-current-team';
import { useTerminalSessionsSuspenseQuery } from '@domains/terminal/services/list-terminal-sessions.http-service';
import { Link, useNavigate, useParams } from '@tanstack/react-router';
import { HardDrive, Plus } from 'lucide-react';
import { useMemo } from 'react';

export const DASHBOARD_DEVICE_PAGE_SIZE = 50;

export function HomePage() {
  const currentOrganization = useCurrentOrganization();
  const currentTeam = useCurrentTeam();
  const params = useParams({ strict: false });
  const teamSlug = 'teamSlug' in params ? (params.teamSlug as string) : '';
  const navigate = useNavigate();

  const organizationId = currentOrganization.id;
  // biome-ignore lint/style/noNonNullAssertion: Team is always defined in team-scoped routes (validated in route loader)
  const teamId = currentTeam!.id;

  const { data: stats } = useOrganizationStatsSuspenseQuery(organizationId);
  const { data: devicesData } = useDevicesSuspenseQuery(
    organizationId,
    teamId,
    1,
    DASHBOARD_DEVICE_PAGE_SIZE,
  );
  const { data: sessionsData } = useTerminalSessionsSuspenseQuery(
    organizationId,
    teamId,
    { status: 'active', size: 1 },
  );

  const devices = devicesData.responseData?.results ?? [];
  const totalDevices = devicesData.responseData?.totalResults ?? 0;
  const activeSessions = sessionsData.responseData?.totalResults ?? 0;

  const onlineCount = useMemo(
    () => devices.filter(isDeviceOnline).length,
    [devices],
  );

  const hasDevices = totalDevices > 0;

  const navigateToDevices = () => {
    navigate({
      to: '/$organizationSlug/t/$teamSlug/devices',
      params: { organizationSlug: currentOrganization.slug, teamSlug },
    });
  };

  const navigateToCommands = (deviceId: number) => {
    navigate({
      to: '/$organizationSlug/t/$teamSlug/commands',
      params: { organizationSlug: currentOrganization.slug, teamSlug },
      search: { executeModal: 'open', deviceId },
    });
  };

  const navigateToTerminal = (deviceId: number) => {
    navigate({
      to: '/$organizationSlug/t/$teamSlug/terminal',
      params: { organizationSlug: currentOrganization.slug, teamSlug },
      search: { deviceId },
    });
  };

  return (
    <PageSection>
      <Stack gap="lg">
        <PageHeadingBar>
          <Box>
            <PageTitle>Dashboard</PageTitle>
          </Box>
        </PageHeadingBar>

        <StatCards
          devicesOnline={onlineCount}
          devicesTotal={totalDevices}
          commandsIn24h={stats.responseData?.results?.recentCommandCount ?? 0}
          activeSessions={activeSessions}
        />

        {hasDevices ? (
          <DashboardDeviceGrid
            devices={devices}
            onRemove={navigateToDevices}
            onExecuteCommand={navigateToCommands}
            onOpenTerminal={navigateToTerminal}
          />
        ) : (
          <EmptyState
            icon={HardDrive}
            title="Add Your First Device"
            description="Get started by registering a device to manage remotely."
            action={
              <Stack
                gap="sm"
                align="center"
              >
                <Button
                  size="lg"
                  render={
                    <Link
                      to="/$organizationSlug/t/$teamSlug/devices"
                      params={{
                        organizationSlug: currentOrganization.slug,
                        teamSlug,
                      }}
                    />
                  }
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Device
                </Button>
                <SecondaryText>
                  Try Cmd+K to search and navigate quickly
                </SecondaryText>
              </Stack>
            }
          />
        )}
      </Stack>
    </PageSection>
  );
}
