import { createQueryThemeWrapper } from '@lib/test-wrappers.utils';
import { useNotificationsSuspenseQuery } from '@services/notifications/list-notifications.http-service';
import { renderHook, waitFor } from '@testing-library/react';

describe('Notifications HTTP Service', () => {
  describe('useNotificationsSuspenseQuery', () => {
    it('should fetch notifications with default pagination', async () => {
      const { result } = renderHook(
        () => useNotificationsSuspenseQuery('org-123'),
        {
          wrapper: createQueryThemeWrapper(),
        },
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      const data = result.current.data?.responseData;
      expect(data?.results).toBeDefined();
      expect(data?.results.length).toBeGreaterThan(0);
      expect(data?.page).toBe(1);
      expect(data?.size).toBe(10);
    });

    it('should return notification entries with correct shape', async () => {
      const { result } = renderHook(
        () => useNotificationsSuspenseQuery('org-123'),
        {
          wrapper: createQueryThemeWrapper(),
        },
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      const entry = result.current.data?.responseData?.results[0];
      expect(entry).toBeDefined();
      expect(entry?.id).toEqual(expect.any(Number));
      expect(entry?.message).toEqual(expect.any(String));
      expect(entry?.resourceId).toEqual(expect.any(String));
      expect(['command', 'device']).toContain(entry?.resourceType);
      expect(['success', 'error', 'warning', 'info']).toContain(
        entry?.severity,
      );
      expect(typeof entry?.read).toBe('boolean');
      expect(entry?.createdAt).toEqual(expect.any(String));
    });

    it('should include both read and unread notifications', async () => {
      const { result } = renderHook(
        () => useNotificationsSuspenseQuery('org-123'),
        {
          wrapper: createQueryThemeWrapper(),
        },
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      const data = result.current.data?.responseData;
      const hasRead = data?.results.some((n) => n.read === true);
      const hasUnread = data?.results.some((n) => n.read === false);
      expect(hasRead).toBe(true);
      expect(hasUnread).toBe(true);
    });

    it('should include both success and error notifications', async () => {
      const { result } = renderHook(
        () => useNotificationsSuspenseQuery('org-123'),
        {
          wrapper: createQueryThemeWrapper(),
        },
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      const data = result.current.data?.responseData;
      const hasSuccess = data?.results.some((n) => n.severity === 'success');
      const hasError = data?.results.some((n) => n.severity === 'error');
      expect(hasSuccess).toBe(true);
      expect(hasError).toBe(true);
    });

    it('should return correct pagination metadata', async () => {
      const { result } = renderHook(
        () => useNotificationsSuspenseQuery('org-123', { size: 2, page: 1 }),
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
      expect(data?.totalResults).toBe(5);
      expect(data?.results).toHaveLength(2);
    });
  });
});
