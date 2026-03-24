import type { CommandPaletteResult } from '@components/ds/molecules/command-palette.types';
import { useDevicesQueryOptions } from '@domains/devices/services/list-devices.http-service';
import type { CommandPaletteGroup } from '@domains/shared/hooks/use-command-palette-search.types';
import { useCurrentOrganization } from '@domains/shared/hooks/use-current-organization';
import { useCurrentTeam } from '@domains/shared/hooks/use-current-team';
import { useRecentItemsStore } from '@domains/shared/stores/recent-items.store';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

const NAVIGATION_ITEMS = [
  { id: 'nav-dashboard', type: 'navigation', label: 'Dashboard' },
  { id: 'nav-devices', type: 'navigation', label: 'Devices' },
  { id: 'nav-commands', type: 'navigation', label: 'Commands' },
  { id: 'nav-terminal', type: 'navigation', label: 'Terminal Sessions' },
  {
    id: 'nav-terminal-bookmarks',
    type: 'navigation',
    label: 'Terminal Bookmarks',
  },
  { id: 'nav-audit-logs', type: 'navigation', label: 'Audit Logs' },
  { id: 'nav-settings', type: 'navigation', label: 'Organization Settings' },
] as const satisfies readonly CommandPaletteResult[];

const ACTION_ITEMS = [
  { id: 'action-new-command', type: 'action', label: 'New Command' },
  { id: 'action-new-session', type: 'action', label: 'New Terminal Session' },
] as const satisfies readonly CommandPaletteResult[];

function fuzzyMatch(text: string, query: string) {
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  return lowerQuery.split('').every((char) => {
    const index = lowerText.indexOf(char);
    if (index === -1) {
      return false;
    }
    return true;
  });
}

function filterResults(items: readonly CommandPaletteResult[], query: string) {
  if (!query) {
    return items;
  }
  return items.filter((item) => fuzzyMatch(item.label, query));
}

const ALL_DEVICES_SIZE = 100;

export function useCommandPaletteSearch(query: string, enabled: boolean) {
  const recentItems = useRecentItemsStore((s) => s.recentItems);
  const currentOrganization = useCurrentOrganization();
  const currentTeam = useCurrentTeam();

  const organizationId = currentOrganization.id;
  const teamId = currentTeam?.id ?? '';

  const { data: devicesData } = useQuery({
    ...useDevicesQueryOptions(organizationId, teamId, 1, ALL_DEVICES_SIZE),
    enabled: enabled && !!teamId,
  });

  const deviceResults = useMemo((): CommandPaletteResult[] => {
    const results = devicesData?.responseData?.results;
    if (!results) {
      return [];
    }
    return results.map((device) => ({
      id: String(device.id),
      type: 'device' as const,
      label: device.deviceName,
      lastSeenAt: device.lastSeenAt ?? undefined,
    }));
  }, [devicesData]);

  const groups = useMemo((): CommandPaletteGroup[] => {
    if (!query) {
      return recentItems.length > 0
        ? [{ label: 'Recent', results: recentItems }]
        : [
            { label: 'Navigation', results: NAVIGATION_ITEMS },
            { label: 'Actions', results: ACTION_ITEMS },
          ];
    }

    const filteredDevices = filterResults(deviceResults, query);
    const filteredActions = filterResults(ACTION_ITEMS, query);
    const filteredNavigation = filterResults(NAVIGATION_ITEMS, query);

    const result: CommandPaletteGroup[] = [];
    if (filteredDevices.length > 0) {
      result.push({ label: 'Devices', results: filteredDevices });
    }
    if (filteredActions.length > 0) {
      result.push({ label: 'Actions', results: filteredActions });
    }
    if (filteredNavigation.length > 0) {
      result.push({ label: 'Navigation', results: filteredNavigation });
    }
    return result;
  }, [query, deviceResults, recentItems]);

  return { groups };
}
