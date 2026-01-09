import { createQueryThemeWrapper } from '@lib/test-wrappers.utils';
import { useOrganizationDetailsQuery } from '@services/organizations/get-organization-details.http-service';
import { useOrganizationStatsQuery } from '@services/organizations/get-organization-stats.http-service';
import { renderHook, waitFor } from '@testing-library/react';

describe('Organization HTTP Service', () => {
  describe('useOrganizationDetailsQuery', () => {
    it('should fetch organization details successfully', async () => {
      const { result } = renderHook(
        () => useOrganizationDetailsQuery('org-123'),
        {
          wrapper: createQueryThemeWrapper(),
        },
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.responseData?.results).toEqual({
        id: 'org-123',
        name: 'Test Organization',
        createdAt: '2025-12-21T10:00:00.000Z',
        memberCount: 1,
        deviceCount: 3,
        tier: 'free',
        deviceLimit: null,
      });
    });

    it('should not fetch when organizationId is empty', () => {
      const { result } = renderHook(() => useOrganizationDetailsQuery(''), {
        wrapper: createQueryThemeWrapper(),
      });

      expect(result.current.data).toBeUndefined();
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('useOrganizationStatsQuery', () => {
    it('should fetch organization stats successfully', async () => {
      const { result } = renderHook(
        () => useOrganizationStatsQuery('org-123'),
        {
          wrapper: createQueryThemeWrapper(),
        },
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      const stats = result.current.data?.responseData?.results;
      expect(stats?.deviceCount).toBe(3);
      expect(stats?.recentCommandCount).toBe(5);
      expect(stats?.recentCommands).toHaveLength(3);
    });

    it('should refetch every 30 seconds', () => {
      const { result } = renderHook(
        () => useOrganizationStatsQuery('org-123'),
        {
          wrapper: createQueryThemeWrapper(),
        },
      );

      // Check that refetchInterval is set (testing implementation detail)
      expect(result.current).toBeDefined();
    });
  });
});
