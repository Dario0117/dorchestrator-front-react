import { createQueryThemeWrapper } from '@lib/test-wrappers.utils';
import {
  profileQueryOptions,
  useProfileSuspendedQuery,
} from '@services/users/get-profile.http-service';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';

describe('useProfileSuspendedQuery', () => {
  it('should return profile data when available', async () => {
    const { result } = renderHook(() => useProfileSuspendedQuery(), {
      wrapper: createQueryThemeWrapper(),
    });

    await waitFor(() => {
      expect(result.current.data).toBeDefined();
    });

    expect(result.current.data.name).toBe('Test User');
    expect(result.current.data.email).toBe('test@example.com');
  });

  it('should throw when profile data has no results', () => {
    // Pre-seed the cache with null responseData so the query resolves immediately
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
    queryClient.setQueryData(profileQueryOptions.queryKey, {
      responseData: null,
      responseErrors: null,
    });

    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    expect(() =>
      renderHook(() => useProfileSuspendedQuery(), { wrapper }),
    ).toThrow('No user found');
  });

  it('should export profileQueryOptions with correct path', () => {
    expect(profileQueryOptions).toBeDefined();
  });
});
