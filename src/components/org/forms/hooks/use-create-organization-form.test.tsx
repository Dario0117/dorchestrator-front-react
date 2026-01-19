import { useCreateOrganizationForm } from '@components/org/forms/hooks/use-create-organization-form';
import { createQueryThemeWrapper } from '@lib/test-wrappers.utils';
import type { useCreateOrganizationMutationType } from '@services/organizations/create-organization.http-service';
import { renderHook, waitFor } from '@testing-library/react';

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
 * Calls onError callback with the provided error.
 */
function createErrorMutation(error: Error): useCreateOrganizationMutationType {
  return {
    mutate: vi.fn((_, options) => {
      options?.onError?.(error, undefined as never, undefined);
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
      id: 'org-1',
      name: 'Test Org',
      slug: 'test-org',
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

    result.current.setFieldValue('name', 'Test Org');
    result.current.setFieldValue('slug', 'test-org');

    await result.current.handleSubmit();

    await waitFor(() => {
      expect(mockMutation.mutate).toHaveBeenCalledWith(
        {
          name: 'Test Org',
          slug: 'test-org',
        },
        expect.any(Object),
      );
      expect(mockHandleSuccess).toHaveBeenCalledWith(mockData);
    });
  });

  it('should handle slug uniqueness error', async () => {
    const mockMutation = createErrorMutation(
      new Error('The slug is already taken'),
    );
    const mockHandleSuccess = vi.fn();

    const { result } = renderHook(
      () =>
        useCreateOrganizationForm({
          createOrganizationMutation: mockMutation,
          handleSuccess: mockHandleSuccess,
        }),
      { wrapper: createQueryThemeWrapper() },
    );

    result.current.setFieldValue('name', 'Test Org');
    result.current.setFieldValue('slug', 'taken-slug');

    await result.current.handleSubmit();

    await waitFor(() => {
      expect(mockHandleSuccess).not.toHaveBeenCalled();
    });
  });

  it('should handle generic errors', async () => {
    const mockMutation = createErrorMutation(new Error('Network error'));
    const mockHandleSuccess = vi.fn();

    const { result } = renderHook(
      () =>
        useCreateOrganizationForm({
          createOrganizationMutation: mockMutation,
          handleSuccess: mockHandleSuccess,
        }),
      { wrapper: createQueryThemeWrapper() },
    );

    result.current.setFieldValue('name', 'Test Org');
    result.current.setFieldValue('slug', 'test-org');

    await result.current.handleSubmit();

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

    result.current.setFieldValue('name', 'New Organization');
    result.current.setFieldValue('slug', 'new-org');

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

    result.current.setFieldValue('name', 'Test Org');
    result.current.setFieldValue('slug', 'test-org');

    await result.current.handleSubmit();

    await waitFor(() => {
      expect(mockMutation.mutate).toHaveBeenCalled();
      // Implementation calls handleSuccess with data regardless of null value
      expect(mockHandleSuccess).toHaveBeenCalledWith(null);
    });
  });

  it('should handle error without message', async () => {
    const mockMutation = {
      mutate: vi.fn((_, options) => {
        options?.onError?.({} as Error, undefined as never, undefined);
      }),
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

    result.current.setFieldValue('name', 'Test Org');
    result.current.setFieldValue('slug', 'test-org');

    await result.current.handleSubmit();

    await waitFor(() => {
      expect(mockHandleSuccess).not.toHaveBeenCalled();
    });
  });
});
