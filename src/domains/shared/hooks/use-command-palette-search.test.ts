import { useCommandPaletteSearch } from '@domains/shared/hooks/use-command-palette-search';
import { useRecentItemsStore } from '@domains/shared/stores/recent-items.store';
import { MSWSuccessHandlers } from '@lib/test.utils';
import { createQueryThemeWrapper } from '@lib/test-wrappers.utils';
import { cleanup, renderHook, waitFor } from '@testing-library/react';
import { setupServer } from 'msw/node';

const useDevicesPresenceMock = vi.fn((deviceIds: number[]) => ({
  presenceMap: new Map(deviceIds.map((id) => [id, id === 1])),
  isLoading: false,
}));

vi.mock('@domains/devices/hooks/use-devices-presence', () => ({
  useDevicesPresence: (...args: unknown[]) =>
    useDevicesPresenceMock(...(args as [number[]])),
}));

vi.mock('@domains/shared/hooks/use-current-organization', () => ({
  useCurrentOrganization: () => ({
    id: 'org-1',
    name: 'Test Organization',
    slug: 'test-org',
  }),
}));

vi.mock('@domains/shared/hooks/use-current-team', () => ({
  useActiveTeam: () => ({
    id: 'team-1',
    name: 'Test Team',
    slug: 'test-team',
  }),
}));

const server = setupServer(...MSWSuccessHandlers());

beforeAll(() => server.listen());
afterEach(() => {
  // Cleanup (unmount) FIRST to prevent Zustand store updates from triggering
  // React re-renders outside act() on still-mounted hook components
  cleanup();
  server.resetHandlers();
  useRecentItemsStore.getState().clearRecent();
});
afterAll(() => server.close());

describe('useCommandPaletteSearch', () => {
  describe('when query is empty and no recent items', () => {
    it('returns Navigation and Actions groups', async () => {
      const { result } = renderHook(() => useCommandPaletteSearch('', true), {
        wrapper: createQueryThemeWrapper(),
      });

      await waitFor(() => {
        const { groups } = result.current;
        expect(groups).toHaveLength(2);
        expect(groups.map((g) => g.label)).toEqual(['Navigation', 'Actions']);
      });
    });

    it('returns all navigation items', async () => {
      const { result } = renderHook(() => useCommandPaletteSearch('', true), {
        wrapper: createQueryThemeWrapper(),
      });

      await waitFor(() => {
        const navGroup = result.current.groups.find(
          (g) => g.label === 'Navigation',
        );
        expect(navGroup).toBeDefined();
        expect(navGroup?.results).toHaveLength(7);
        expect(navGroup?.results.map((r) => r.label)).toEqual([
          'Dashboard',
          'Devices',
          'Commands',
          'Terminal Sessions',
          'Terminal Bookmarks',
          'Audit Logs',
          'Organization Settings',
        ]);
      });
    });

    it('returns all action items', async () => {
      const { result } = renderHook(() => useCommandPaletteSearch('', true), {
        wrapper: createQueryThemeWrapper(),
      });

      await waitFor(() => {
        const actionGroup = result.current.groups.find(
          (g) => g.label === 'Actions',
        );
        expect(actionGroup).toBeDefined();
        expect(actionGroup?.results).toHaveLength(2);
        expect(actionGroup?.results.map((r) => r.label)).toEqual([
          'New Command',
          'New Terminal Session',
        ]);
      });
    });
  });

  describe('when query is empty and recent items exist', () => {
    it('returns Recent group with recent items', async () => {
      useRecentItemsStore.getState().addRecentItem({
        id: 'nav-dashboard',
        type: 'navigation',
        label: 'Dashboard',
      });

      const { result } = renderHook(() => useCommandPaletteSearch('', true), {
        wrapper: createQueryThemeWrapper(),
      });

      await waitFor(() => {
        const { groups } = result.current;
        expect(groups).toHaveLength(1);
        expect(groups.map((g) => g.label)).toEqual(['Recent']);

        const recentGroup = groups.find((g) => g.label === 'Recent');
        expect(recentGroup?.results).toHaveLength(1);
        expect(recentGroup?.results.map((r) => r.label)).toEqual(['Dashboard']);
      });
    });
  });

  describe('when query is provided', () => {
    it('filters navigation items by fuzzy match', async () => {
      const { result } = renderHook(
        () => useCommandPaletteSearch('Dash', true),
        { wrapper: createQueryThemeWrapper() },
      );

      await waitFor(() => {
        const navGroup = result.current.groups.find(
          (g) => g.label === 'Navigation',
        );
        expect(navGroup).toBeDefined();
        expect(navGroup?.results).toHaveLength(1);
        expect(navGroup?.results.map((r) => r.label)).toEqual(['Dashboard']);
      });
    });

    it('filters action items by fuzzy match', async () => {
      const { result } = renderHook(
        () => useCommandPaletteSearch('New', true),
        { wrapper: createQueryThemeWrapper() },
      );

      await waitFor(() => {
        const actionGroup = result.current.groups.find(
          (g) => g.label === 'Actions',
        );
        expect(actionGroup).toBeDefined();
        expect(actionGroup?.results).toHaveLength(2);
      });
    });

    it('returns empty groups when no items match', async () => {
      const { result } = renderHook(
        () => useCommandPaletteSearch('xyznonexistent', true),
        { wrapper: createQueryThemeWrapper() },
      );

      await waitFor(() => {
        expect(result.current.groups).toHaveLength(0);
      });
    });

    it('filters devices from MSW response by fuzzy match', async () => {
      const { result } = renderHook(
        () => useCommandPaletteSearch('Test Server', true),
        { wrapper: createQueryThemeWrapper() },
      );

      await waitFor(() => {
        const deviceGroup = result.current.groups.find(
          (g) => g.label === 'Devices',
        );
        expect(deviceGroup).toBeDefined();
        expect(
          deviceGroup?.results.some((r) => r.label === 'Test Server'),
        ).toBe(true);
      });
    });

    it('maps device isOnline from presence', async () => {
      const { result } = renderHook(
        () => useCommandPaletteSearch('Build Agent', true),
        { wrapper: createQueryThemeWrapper() },
      );

      await waitFor(() => {
        const deviceGroup = result.current.groups.find(
          (g) => g.label === 'Devices',
        );
        expect(deviceGroup).toBeDefined();
        const buildAgent = deviceGroup?.results.find(
          (r) => r.label === 'Build Agent',
        );
        expect(buildAgent).toBeDefined();
        expect(buildAgent?.type === 'device' ? buildAgent.isOnline : true).toBe(
          false,
        );
      });
    });

    it('excludes groups with zero matching results', async () => {
      const { result } = renderHook(
        () => useCommandPaletteSearch('Dashboard', true),
        { wrapper: createQueryThemeWrapper() },
      );

      await waitFor(() => {
        const actionGroup = result.current.groups.find(
          (g) => g.label === 'Actions',
        );
        expect(actionGroup).toBeUndefined();
      });
    });

    it('performs fuzzy matching (non-contiguous characters)', async () => {
      const { result } = renderHook(
        () => useCommandPaletteSearch('Dbd', true),
        { wrapper: createQueryThemeWrapper() },
      );

      await waitFor(() => {
        const navGroup = result.current.groups.find(
          (g) => g.label === 'Navigation',
        );
        expect(navGroup).toBeDefined();
        expect(navGroup?.results.some((r) => r.label === 'Dashboard')).toBe(
          true,
        );
      });
    });

    it('fuzzy match rejects when character is not found', async () => {
      const { result } = renderHook(
        () => useCommandPaletteSearch('Dashz', true),
        { wrapper: createQueryThemeWrapper() },
      );

      await waitFor(() => {
        const navGroup = result.current.groups.find(
          (g) => g.label === 'Navigation',
        );
        expect(
          navGroup?.results.some((r) => r.label === 'Dashboard'),
        ).toBeFalsy();
      });
    });
  });

  describe('when disabled', () => {
    it('does not fetch devices when enabled is false', async () => {
      const { result } = renderHook(
        () => useCommandPaletteSearch('Test', false),
        { wrapper: createQueryThemeWrapper() },
      );

      await waitFor(() => {
        const deviceGroup = result.current.groups.find(
          (g) => g.label === 'Devices',
        );
        expect(deviceGroup).toBeUndefined();
      });
    });
  });

  describe('when presence data is missing for a device', () => {
    it('defaults isOnline to false via nullish coalescing', async () => {
      useDevicesPresenceMock.mockImplementation(() => ({
        presenceMap: new Map(),
        isLoading: false,
      }));

      const { result } = renderHook(
        () => useCommandPaletteSearch('Test Server', true),
        { wrapper: createQueryThemeWrapper() },
      );

      await waitFor(() => {
        const deviceGroup = result.current.groups.find(
          (g) => g.label === 'Devices',
        );
        expect(deviceGroup).toBeDefined();
        const testServer = deviceGroup?.results.find(
          (r) => r.label === 'Test Server',
        );
        expect(testServer).toBeDefined();
        expect(testServer?.type === 'device' ? testServer.isOnline : true).toBe(
          false,
        );
      });

      useDevicesPresenceMock.mockImplementation((deviceIds: number[]) => ({
        presenceMap: new Map(deviceIds.map((id) => [id, id === 1])),
        isLoading: false,
      }));
    });
  });
});
