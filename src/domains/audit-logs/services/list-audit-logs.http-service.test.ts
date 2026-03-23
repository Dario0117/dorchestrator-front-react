import { useAuditLogsSuspenseQuery } from '@domains/audit-logs/services/list-audit-logs.http-service';
import { createQueryThemeWrapper } from '@lib/test-wrappers.utils';
import { renderHook, waitFor } from '@testing-library/react';

describe('Audit Logs HTTP Service', () => {
  describe('useAuditLogsSuspenseQuery', () => {
    it('should fetch audit logs with default pagination and include actorEmail', async () => {
      const { result } = renderHook(
        () => useAuditLogsSuspenseQuery('org-123'),
        {
          wrapper: createQueryThemeWrapper(),
        },
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      const data = result.current.data?.responseData;
      expect(data?.results).toBeDefined();
      expect(data?.results.length).toBeGreaterThan(0);
      expect(data?.page).toBe(1);
      expect(data?.size).toBe(25);

      const entryWithActor = data?.results.find(
        (entry) => entry.actorId !== null,
      );
      expect(entryWithActor?.actorEmail).toEqual(expect.any(String));

      const entryWithoutActor = data?.results.find(
        (entry) => entry.actorId === null,
      );
      expect(entryWithoutActor?.actorEmail).toBeNull();
    });

    it('should pass filter parameters correctly', async () => {
      const { result } = renderHook(
        () =>
          useAuditLogsSuspenseQuery('org-123', {
            action: 'created',
            resourceType: 'command',
          }),
        {
          wrapper: createQueryThemeWrapper(),
        },
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      const data = result.current.data?.responseData;
      expect(data?.results).toBeDefined();
      expect(data?.results.length).toBeGreaterThan(0);
      for (const entry of data?.results ?? []) {
        expect(entry.action).toBe('created');
        expect(entry.resourceType).toBe('command');
      }
    });

    it('should filter by fromDate and toDate', async () => {
      // Mock data spans from ~1 hour ago to ~1 minute ago
      // Use a 25-minute-ago cutoff to split the data
      const cutoff = new Date(Date.now() - 1500000).toISOString();

      const { result: recentResult } = renderHook(
        () => useAuditLogsSuspenseQuery('org-123', { fromDate: cutoff }),
        {
          wrapper: createQueryThemeWrapper(),
        },
      );

      await waitFor(() => expect(recentResult.current.isSuccess).toBe(true));

      const recentData = recentResult.current.data?.responseData;
      expect(recentData?.results).toBeDefined();
      expect(recentData?.results.length).toBeGreaterThan(0);
      for (const entry of recentData?.results ?? []) {
        expect(entry.createdAt >= cutoff).toBe(true);
      }

      const { result: olderResult } = renderHook(
        () => useAuditLogsSuspenseQuery('org-123', { toDate: cutoff }),
        {
          wrapper: createQueryThemeWrapper(),
        },
      );

      await waitFor(() => expect(olderResult.current.isSuccess).toBe(true));

      const olderData = olderResult.current.data?.responseData;
      expect(olderData?.results).toBeDefined();
      expect(olderData?.results.length).toBeGreaterThan(0);
      for (const entry of olderData?.results ?? []) {
        expect(entry.createdAt <= cutoff).toBe(true);
      }

      // Combined: recent + older should cover all entries
      expect(
        (recentData?.totalResults ?? 0) + (olderData?.totalResults ?? 0),
      ).toBeGreaterThanOrEqual(8);
    });

    it('should handle empty results', async () => {
      const { result } = renderHook(
        () =>
          useAuditLogsSuspenseQuery('org-123', {
            resourceType: 'device',
            action: 'updated',
          }),
        {
          wrapper: createQueryThemeWrapper(),
        },
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      const data = result.current.data?.responseData;
      expect(data?.results).toEqual([]);
      expect(data?.totalResults).toBe(0);
    });

    it('should return correct pagination metadata for page 1', async () => {
      const { result } = renderHook(
        () => useAuditLogsSuspenseQuery('org-123', { size: 2, page: 1 }),
        {
          wrapper: createQueryThemeWrapper(),
        },
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      const data = result.current.data?.responseData;
      expect(data?.size).toBe(2);
      expect(data?.page).toBe(1);
      expect(data?.hasNext).toBe(true);
      expect(data?.hasPrevious).toBe(false);
      expect(data?.totalPages).toBe(4);
      expect(data?.totalResults).toBe(8);
      expect(data?.results).toHaveLength(2);
    });

    it('should return correct pagination metadata for page 2', async () => {
      const { result } = renderHook(
        () => useAuditLogsSuspenseQuery('org-123', { size: 2, page: 2 }),
        {
          wrapper: createQueryThemeWrapper(),
        },
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      const data = result.current.data?.responseData;
      expect(data?.size).toBe(2);
      expect(data?.page).toBe(2);
      expect(data?.hasNext).toBe(true);
      expect(data?.hasPrevious).toBe(true);
      expect(data?.totalPages).toBe(4);
      expect(data?.results).toHaveLength(2);
    });
  });
});
