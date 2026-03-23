import { useCreateOrganizationForm } from '@domains/org/forms/hooks/use-create-organization-form';
import type { useCreateOrganizationMutationType } from '@domains/org/services/organizations/create-organization.http-service';
import * as loggerUtils from '@lib/logger.utils';
import { createQueryThemeWrapper } from '@lib/test-wrappers.utils';
import { act, renderHook, waitFor } from '@testing-library/react';

/**
 * Helper to create a mock mutation with mutate callback pattern.
 * Simulates success by calling onSuccess callback.
 */
function createSuccessMutation(
  data: unknown,
): useCreateOrganizationMutationType {
  return {
    mutate: vi.fn((_, options) => {
      options?.onSuccess?.(data as never, undefined as never, undefined);
    }),
  } as unknown as useCreateOrganizationMutationType;
}

/**
 * Helper to create a mock mutation that simulates error.
 * Calls onError callback with the provided error (responseErrors shape).
 */
function createErrorMutation(error: {
  responseErrors?: Record<string, string[]> | null;
}): useCreateOrganizationMutationType {
  return {
    mutate: vi.fn((_, options) => {
      options?.onError?.(error as never, undefined as never, undefined);
    }),
  } as unknown as useCreateOrganizationMutationType;
}

describe('useCreateOrganizationForm', () => {
  it('should initialize with empty default values', () => {
    const mockMutation = {
      mutate: vi.fn(),
    } as unknown as useCreateOrganizationMutationType;
    const mockHandleSuccess = vi.fn();

    const { result } = renderHook(
      () =>
        useCreateOrganizationForm({
          createOrganizationMutation: mockMutation,
          handleSuccess: mockHandleSuccess,
        }),
      { wrapper: createQueryThemeWrapper() },
    );

    expect(result.current.state.values.name).toBe('');
    expect(result.current.state.values.slug).toBe('');
  });

  it('should call handleSuccess on successful submission', async () => {
    const mockData = {
      responseData: {
        results: {
          id: 'org-1',
          name: 'Test Org',
          slug: 'test-org',
          createdAt: '2025-12-21T10:00:00.000Z',
        },
      },
      responseErrors: null,
    };
    const mockMutation = createSuccessMutation(mockData);
    const mockHandleSuccess = vi.fn();

    const { result } = renderHook(
      () =>
        useCreateOrganizationForm({
          createOrganizationMutation: mockMutation,
          handleSuccess: mockHandleSuccess,
        }),
      { wrapper: createQueryThemeWrapper() },
    );

    await act(async () => {
      result.current.setFieldValue('name', 'Test Org');
      result.current.setFieldValue('slug', 'test-org');
      await result.current.handleSubmit();
    });

    await waitFor(() => {
      expect(mockMutation.mutate).toHaveBeenCalledWith(
        {
          body: {
            name: 'Test Org',
            slug: 'test-org',
          },
        },
        expect.any(Object),
      );
      expect(mockHandleSuccess).toHaveBeenCalledWith(mockData);
    });
  });

  it('should handle slug field error', async () => {
    vi.spyOn(loggerUtils, 'logError').mockImplementation(vi.fn());
    const mockMutation = createErrorMutation({
      responseErrors: { slug: ['This slug is already taken'] },
    });
    const mockHandleSuccess = vi.fn();

    const { result } = renderHook(
      () =>
        useCreateOrganizationForm({
          createOrganizationMutation: mockMutation,
          handleSuccess: mockHandleSuccess,
        }),
      { wrapper: createQueryThemeWrapper() },
    );

    await act(async () => {
      result.current.setFieldValue('name', 'Test Org');
      result.current.setFieldValue('slug', 'taken-slug');
      await result.current.handleSubmit();
    });

    await waitFor(() => {
      expect(mockHandleSuccess).not.toHaveBeenCalled();
    });
  });

  it('should handle name field error', async () => {
    vi.spyOn(loggerUtils, 'logError').mockImplementation(vi.fn());
    const mockMutation = createErrorMutation({
      responseErrors: { name: ['Name is reserved'] },
    });
    const mockHandleSuccess = vi.fn();

    const { result } = renderHook(
      () =>
        useCreateOrganizationForm({
          createOrganizationMutation: mockMutation,
          handleSuccess: mockHandleSuccess,
        }),
      { wrapper: createQueryThemeWrapper() },
    );

    await act(async () => {
      result.current.setFieldValue('name', 'Admin');
      result.current.setFieldValue('slug', 'admin-org');
      await result.current.handleSubmit();
    });

    await waitFor(() => {
      expect(mockHandleSuccess).not.toHaveBeenCalled();
    });
  });

  it('should handle non-field errors', async () => {
    vi.spyOn(loggerUtils, 'logError').mockImplementation(vi.fn());
    const mockMutation = createErrorMutation({
      responseErrors: { nonFieldErrors: ['Something went wrong'] },
    });
    const mockHandleSuccess = vi.fn();

    const { result } = renderHook(
      () =>
        useCreateOrganizationForm({
          createOrganizationMutation: mockMutation,
          handleSuccess: mockHandleSuccess,
        }),
      { wrapper: createQueryThemeWrapper() },
    );

    await act(async () => {
      result.current.setFieldValue('name', 'Test Org');
      result.current.setFieldValue('slug', 'test-org');
      await result.current.handleSubmit();
    });

    await waitFor(() => {
      expect(mockHandleSuccess).not.toHaveBeenCalled();
    });
  });

  it('should allow field values to be updated', () => {
    const mockMutation = {
      mutate: vi.fn(),
    } as unknown as useCreateOrganizationMutationType;
    const mockHandleSuccess = vi.fn();

    const { result } = renderHook(
      () =>
        useCreateOrganizationForm({
          createOrganizationMutation: mockMutation,
          handleSuccess: mockHandleSuccess,
        }),
      { wrapper: createQueryThemeWrapper() },
    );

    act(() => {
      result.current.setFieldValue('name', 'New Organization');
      result.current.setFieldValue('slug', 'new-org');
    });

    expect(result.current.state.values.name).toBe('New Organization');
    expect(result.current.state.values.slug).toBe('new-org');
  });

  it('should call handleSuccess even when mutation returns null', async () => {
    const mockMutation = createSuccessMutation(null);
    const mockHandleSuccess = vi.fn();

    const { result } = renderHook(
      () =>
        useCreateOrganizationForm({
          createOrganizationMutation: mockMutation,
          handleSuccess: mockHandleSuccess,
        }),
      { wrapper: createQueryThemeWrapper() },
    );

    await act(async () => {
      result.current.setFieldValue('name', 'Test Org');
      result.current.setFieldValue('slug', 'test-org');
      await result.current.handleSubmit();
    });

    await waitFor(() => {
      expect(mockMutation.mutate).toHaveBeenCalled();
      // Implementation calls handleSuccess with data regardless of null value
      expect(mockHandleSuccess).toHaveBeenCalledWith(null);
    });
  });

  it('should handle error without responseErrors', async () => {
    vi.spyOn(loggerUtils, 'logError').mockImplementation(vi.fn());
    const mockMutation = createErrorMutation({
      responseErrors: null,
    });
    const mockHandleSuccess = vi.fn();

    const { result } = renderHook(
      () =>
        useCreateOrganizationForm({
          createOrganizationMutation: mockMutation,
          handleSuccess: mockHandleSuccess,
        }),
      { wrapper: createQueryThemeWrapper() },
    );

    await act(async () => {
      result.current.setFieldValue('name', 'Test Org');
      result.current.setFieldValue('slug', 'test-org');
      await result.current.handleSubmit();
    });

    await waitFor(() => {
      expect(mockHandleSuccess).not.toHaveBeenCalled();
    });
  });
});
