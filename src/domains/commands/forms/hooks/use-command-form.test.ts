import { useCommandForm } from '@domains/commands/forms/hooks/use-command-form';
import type { useSubmitCommandMutationType } from '@domains/commands/services/submit-command.http-service';
import * as loggerUtils from '@lib/logger.utils';
import { createQueryThemeWrapper } from '@lib/test-wrappers.utils';
import { act, renderHook, waitFor } from '@testing-library/react';

function createSuccessMutation(data: unknown): useSubmitCommandMutationType {
  return {
    mutate: vi.fn((_, options) => {
      options?.onSuccess?.(data as never, undefined as never, undefined);
    }),
  } as unknown as useSubmitCommandMutationType;
}

function createErrorMutation(error: {
  responseErrors?: Record<string, string[]> | null;
}): useSubmitCommandMutationType {
  return {
    mutate: vi.fn((_, options) => {
      options?.onError?.(error as never, undefined as never, undefined);
    }),
  } as unknown as useSubmitCommandMutationType;
}

describe('useCommandForm', () => {
  it('should initialize with default values', () => {
    const mockMutation = {
      mutate: vi.fn(),
    } as unknown as useSubmitCommandMutationType;
    const mockHandleSuccess = vi.fn();

    const { result } = renderHook(
      () =>
        useCommandForm({
          submitCommandMutation: mockMutation,
          handleSuccess: mockHandleSuccess,
          organizationId: 'org-1',
          teamId: 'team-1',
        }),
      { wrapper: createQueryThemeWrapper() },
    );

    expect(result.current.state.values.deviceId).toBe(0);
    expect(result.current.state.values.command).toBe('');
  });

  it('should call handleSuccess on successful submission', async () => {
    const mockData = {
      responseData: {
        results: {
          commandId: 42,
          status: 'pending',
          createdAt: '2026-02-16T10:00:00.000Z',
        },
      },
      responseErrors: null,
    };
    const mockMutation = createSuccessMutation(mockData);
    const mockHandleSuccess = vi.fn();

    const { result } = renderHook(
      () =>
        useCommandForm({
          submitCommandMutation: mockMutation,
          handleSuccess: mockHandleSuccess,
          organizationId: 'org-1',
          teamId: 'team-1',
        }),
      { wrapper: createQueryThemeWrapper() },
    );

    await act(async () => {
      result.current.setFieldValue('deviceId', 1);
      result.current.setFieldValue('command', 'echo hello');
      await result.current.handleSubmit();
    });

    await waitFor(() => {
      expect(mockMutation.mutate).toHaveBeenCalledWith(
        {
          body: {
            deviceId: 1,
            command: 'echo hello',
          },
          params: {
            path: { organizationId: 'org-1', teamId: 'team-1' },
          },
        },
        expect.any(Object),
      );
      expect(mockHandleSuccess).toHaveBeenCalledWith(mockData);
    });
  });

  it('should handle field errors from API response', async () => {
    vi.spyOn(loggerUtils, 'logError').mockImplementation(vi.fn());
    const mockMutation = createErrorMutation({
      responseErrors: { command: ['Command is too long'] },
    });
    const mockHandleSuccess = vi.fn();

    const { result } = renderHook(
      () =>
        useCommandForm({
          submitCommandMutation: mockMutation,
          handleSuccess: mockHandleSuccess,
          organizationId: 'org-1',
          teamId: 'team-1',
        }),
      { wrapper: createQueryThemeWrapper() },
    );

    await act(async () => {
      result.current.setFieldValue('deviceId', 1);
      result.current.setFieldValue('command', 'x'.repeat(11000));
      await result.current.handleSubmit();
    });

    await waitFor(() => {
      expect(mockHandleSuccess).not.toHaveBeenCalled();
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
        useCommandForm({
          submitCommandMutation: mockMutation,
          handleSuccess: mockHandleSuccess,
          organizationId: 'org-1',
          teamId: 'team-1',
        }),
      { wrapper: createQueryThemeWrapper() },
    );

    await act(async () => {
      result.current.setFieldValue('deviceId', 1);
      result.current.setFieldValue('command', 'test');
      await result.current.handleSubmit();
    });

    await waitFor(() => {
      expect(mockHandleSuccess).not.toHaveBeenCalled();
    });
  });

  it('should allow field values to be updated', () => {
    const mockMutation = {
      mutate: vi.fn(),
    } as unknown as useSubmitCommandMutationType;
    const mockHandleSuccess = vi.fn();

    const { result } = renderHook(
      () =>
        useCommandForm({
          submitCommandMutation: mockMutation,
          handleSuccess: mockHandleSuccess,
          organizationId: 'org-1',
          teamId: 'team-1',
        }),
      { wrapper: createQueryThemeWrapper() },
    );

    act(() => {
      result.current.setFieldValue('deviceId', 5);
      result.current.setFieldValue('command', 'systemctl status nginx');
    });

    expect(result.current.state.values.deviceId).toBe(5);
    expect(result.current.state.values.command).toBe('systemctl status nginx');
  });
});
