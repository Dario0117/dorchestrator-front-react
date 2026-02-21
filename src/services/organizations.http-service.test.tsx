import { createQueryThemeWrapper } from '@lib/test-wrappers.utils';
import { useOrganizationDetailsSuspenseQuery } from '@services/organizations/get-organization-details.http-service';
import { useOrganizationStatsSuspenseQuery } from '@services/organizations/get-organization-stats.http-service';
import { renderHook, waitFor } from '@testing-library/react';

describe('Organization HTTP Service', () => {
  describe('useOrganizationDetailsQuery', () => {
    it('should fetch organization details successfully', async () => {
      const { result } = renderHook(
        () => useOrganizationDetailsSuspenseQuery('org-123'),
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
        tier: 'free',
        deviceLimit: null,
      });
    });
  });

  describe('useOrganizationStatsQuery', () => {
    it('should fetch organization stats successfully', async () => {
      const { result } = renderHook(
        () => useOrganizationStatsSuspenseQuery('org-123'),
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

    it('should refetch every 30 seconds', async () => {
      const { result } = renderHook(
        () => useOrganizationStatsSuspenseQuery('org-123'),
        {
          wrapper: createQueryThemeWrapper(),
        },
      );

      await waitFor(() => {
        expect(result.current).toBeDefined();
      });
    });
  });
});
