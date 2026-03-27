import { useCreateTeamForm } from '@domains/org/forms/hooks/use-create-team-form';
import type { useCreateTeamMutationType } from '@domains/org/services/teams/create-team.http-service';
import * as loggerUtils from '@lib/logger.utils';
import { createQueryThemeWrapper } from '@lib/test-wrappers.utils';
import { act, renderHook, waitFor } from '@testing-library/react';

function createSuccessMutation(): useCreateTeamMutationType {
  return {
    mutate: vi.fn((_, options) => {
      options?.onSuccess?.(undefined as never, undefined as never, undefined);
    }),
  } as unknown as useCreateTeamMutationType;
}

function createErrorMutation(error: {
  responseErrors?: Record<string, string[]> | null;
}): useCreateTeamMutationType {
  return {
    mutate: vi.fn((_, options) => {
      options?.onError?.(error as never, undefined as never, undefined);
    }),
  } as unknown as useCreateTeamMutationType;
}

describe('useCreateTeamForm', () => {
  it('should initialize with empty default values', () => {
    const mockMutation = {
      mutate: vi.fn(),
    } as unknown as useCreateTeamMutationType;

    const { result } = renderHook(
      () =>
        useCreateTeamForm({
          organizationId: 'org-1',
          createTeamMutation: mockMutation,
          handleSuccess: vi.fn(),
        }),
      { wrapper: createQueryThemeWrapper() },
    );

    expect(result.current.state.values.name).toBe('');
    expect(result.current.state.values.slug).toBe('');
  });

  it('should call mutation with correct params and handleSuccess on success', async () => {
    const mockMutation = createSuccessMutation();
    const mockHandleSuccess = vi.fn();

    const { result } = renderHook(
      () =>
        useCreateTeamForm({
          organizationId: 'org-1',
          createTeamMutation: mockMutation,
          handleSuccess: mockHandleSuccess,
        }),
      { wrapper: createQueryThemeWrapper() },
    );

    await act(async () => {
      result.current.setFieldValue('name', 'My Team');
      result.current.setFieldValue('slug', 'my-team');
      await result.current.handleSubmit();
    });

    await waitFor(() => {
      expect(mockMutation.mutate).toHaveBeenCalledWith(
        {
          params: { path: { organizationId: 'org-1' } },
          body: { name: 'My Team', slug: 'my-team' },
        },
        expect.any(Object),
      );
      expect(mockHandleSuccess).toHaveBeenCalled();
    });
  });

  it('should log error and set form errors on mutation error', async () => {
    const logErrorSpy = vi
      .spyOn(loggerUtils, 'logError')
      .mockImplementation(vi.fn());
    const mockMutation = createErrorMutation({
      responseErrors: { name: ['Name is already taken'] },
    });
    const mockHandleSuccess = vi.fn();

    const { result } = renderHook(
      () =>
        useCreateTeamForm({
          organizationId: 'org-1',
          createTeamMutation: mockMutation,
          handleSuccess: mockHandleSuccess,
        }),
      { wrapper: createQueryThemeWrapper() },
    );

    await act(async () => {
      result.current.setFieldValue('name', 'Taken Name');
      result.current.setFieldValue('slug', 'taken-name');
      await result.current.handleSubmit();
    });

    await waitFor(() => {
      expect(mockHandleSuccess).not.toHaveBeenCalled();
      expect(logErrorSpy).toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.anything() }),
        'Team creation failed',
      );
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
        useCreateTeamForm({
          organizationId: 'org-1',
          createTeamMutation: mockMutation,
          handleSuccess: mockHandleSuccess,
        }),
      { wrapper: createQueryThemeWrapper() },
    );

    await act(async () => {
      result.current.setFieldValue('name', 'Test Team');
      result.current.setFieldValue('slug', 'test-team');
      await result.current.handleSubmit();
    });

    await waitFor(() => {
      expect(mockHandleSuccess).not.toHaveBeenCalled();
    });
  });
});
