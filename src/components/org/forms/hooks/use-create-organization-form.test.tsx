import { useCreateOrganizationForm } from '@components/org/forms/hooks/use-create-organization-form';
import { createQueryThemeWrapper } from '@lib/test-wrappers.utils';
import type { useCreateOrganizationMutationType } from '@services/organizations/create-organization.http-service';
import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

describe('useCreateOrganizationForm', () => {
  it('should initialize with empty default values', () => {
    const mockMutation = {
      mutateAsync: vi.fn(),
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
    const mockMutateAsync = vi.fn().mockResolvedValue({
      id: 'org-1',
      name: 'Test Org',
      slug: 'test-org',
    });
    const mockMutation = {
      mutateAsync: mockMutateAsync,
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
      expect(mockMutateAsync).toHaveBeenCalledWith({
        name: 'Test Org',
        slug: 'test-org',
      });
      expect(mockHandleSuccess).toHaveBeenCalledWith({
        id: 'org-1',
        name: 'Test Org',
        slug: 'test-org',
      });
    });
  });

  it('should handle slug uniqueness error', async () => {
    const mockMutateAsync = vi
      .fn()
      .mockRejectedValue(new Error('The slug is already taken'));
    const mockMutation = {
      mutateAsync: mockMutateAsync,
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
    result.current.setFieldValue('slug', 'taken-slug');

    await result.current.handleSubmit();

    await waitFor(() => {
      expect(mockHandleSuccess).not.toHaveBeenCalled();
    });
  });

  it('should handle generic errors', async () => {
    const mockMutateAsync = vi
      .fn()
      .mockRejectedValue(new Error('Network error'));
    const mockMutation = {
      mutateAsync: mockMutateAsync,
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

  it('should allow field values to be updated', () => {
    const mockMutation = {
      mutateAsync: vi.fn(),
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

  it('should not call handleSuccess when mutation returns null', async () => {
    const mockMutateAsync = vi.fn().mockResolvedValue(null);
    const mockMutation = {
      mutateAsync: mockMutateAsync,
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
      expect(mockMutateAsync).toHaveBeenCalled();
      expect(mockHandleSuccess).not.toHaveBeenCalled();
    });
  });

  it('should handle error without message', async () => {
    const mockMutateAsync = vi.fn().mockRejectedValue({});
    const mockMutation = {
      mutateAsync: mockMutateAsync,
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
