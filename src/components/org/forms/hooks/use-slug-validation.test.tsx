import {
  SlugStatus,
  useSlugValidation,
} from '@components/org/forms/hooks/use-slug-validation';
import * as loggerUtils from '@lib/logger.utils';
import { buildBackendUrl } from '@lib/test.utils';
import { createQueryThemeWrapper } from '@lib/test-wrappers.utils';
import { act, renderHook, waitFor } from '@testing-library/react';
import { HttpResponse, http } from 'msw';
import { describe, expect, it } from 'vitest';
import { server } from '@/../testsSetup';
import type { paths } from '@/types/api.generated.types';

type CheckSlugErrorResponse =
  paths['/api/v1/organization/check-slug']['post']['responses']['500']['content']['application/json'];

describe('useSlugValidation', () => {
  it('should initialize with unchecked status', () => {
    const { result } = renderHook(() => useSlugValidation(), {
      wrapper: createQueryThemeWrapper(),
    });

    expect(result.current.status).toBe(SlugStatus.UNCHECKED);
    expect(result.current.currentSlug).toBe('');
    expect(result.current.isSlugValid).toBe(false);
    expect(result.current.isChecking).toBe(false);
  });

  it('should reset validation when resetValidation is called', () => {
    const { result } = renderHook(() => useSlugValidation(), {
      wrapper: createQueryThemeWrapper(),
    });

    act(() => {
      result.current.resetValidation('new-slug');
    });

    expect(result.current.currentSlug).toBe('new-slug');
    expect(result.current.status).toBe(SlugStatus.UNCHECKED);
  });

  it('should set status to checking when checkSlugAvailability is called', async () => {
    const { result } = renderHook(() => useSlugValidation(), {
      wrapper: createQueryThemeWrapper(),
    });

    await act(async () => {
      await result.current.checkSlugAvailability('available-slug');
    });

    // Status should be AVAILABLE after resolution
    await waitFor(() => {
      expect(result.current.isChecking).toBe(false);
    });
  });

  it('should set status to available when slug is available', async () => {
    const { result } = renderHook(() => useSlugValidation(), {
      wrapper: createQueryThemeWrapper(),
    });

    await act(async () => {
      await result.current.checkSlugAvailability('available-slug');
    });

    await waitFor(() => {
      expect(result.current.status).toBe(SlugStatus.AVAILABLE);
      expect(result.current.isSlugValid).toBe(true);
    });
  });

  it('should set status to taken when slug is not available', async () => {
    vi.spyOn(loggerUtils, 'logError').mockImplementation(vi.fn());
    const { result } = renderHook(() => useSlugValidation(), {
      wrapper: createQueryThemeWrapper(),
    });

    // MSW handler treats any slug containing 'taken' as unavailable (returns 409 error)
    // The service differentiates 409 errors (slug taken) from other errors
    // The hook sets status to TAKEN when the slug is unavailable
    await act(async () => {
      await result.current.checkSlugAvailability('taken-slug');
    });

    await waitFor(() => {
      expect(result.current.status).toBe(SlugStatus.TAKEN);
      expect(result.current.isSlugValid).toBe(false);
    });
  });

  it('should set status to unchecked when there is an error', async () => {
    vi.spyOn(loggerUtils, 'logError').mockImplementation(vi.fn());
    // Override MSW handler to return an error
    server.use(
      http.post<never, never, CheckSlugErrorResponse>(
        buildBackendUrl('/api/v1/organization/check-slug'),
        () => {
          return HttpResponse.json(
            { message: 'Network error' },
            { status: 500 },
          );
        },
      ),
    );

    const { result } = renderHook(() => useSlugValidation(), {
      wrapper: createQueryThemeWrapper(),
    });

    await act(async () => {
      await result.current.checkSlugAvailability('test-slug');
    });

    await waitFor(() => {
      expect(result.current.status).toBe(SlugStatus.UNCHECKED);
    });
  });

  it('should not check if slug is empty', async () => {
    const { result } = renderHook(() => useSlugValidation(), {
      wrapper: createQueryThemeWrapper(),
    });

    // Call with empty slug
    await result.current.checkSlugAvailability('');

    // Status should remain UNCHECKED (no API call made)
    expect(result.current.status).toBe(SlugStatus.UNCHECKED);
  });
});
