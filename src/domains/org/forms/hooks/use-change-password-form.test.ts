import { useChangePasswordForm } from '@domains/org/forms/hooks/use-change-password-form';
import type { useChangePasswordMutationType } from '@domains/org/services/users/change-password.http-service';
import * as loggerUtils from '@lib/logger.utils';
import { createQueryThemeWrapper } from '@lib/test-wrappers.utils';
import { act, renderHook, waitFor } from '@testing-library/react';

function createFakeMutation(
  handler: (
    variables: { currentPassword: string; newPassword: string },
    options?: {
      onSuccess?(data: unknown): void;
      onError?(error: unknown): void;
    },
  ) => void,
) {
  return {
    mutate: handler,
  } as unknown as useChangePasswordMutationType;
}

describe('useChangePasswordForm', () => {
  it('should initialize with empty default values', () => {
    const fakeMutation = createFakeMutation(vi.fn());
    const { result } = renderHook(
      () =>
        useChangePasswordForm({
          changePasswordMutation: fakeMutation,
          handleSuccess: vi.fn(),
        }),
      { wrapper: createQueryThemeWrapper() },
    );

    expect(result.current.state.values.currentPassword).toBe('');
    expect(result.current.state.values.newPassword).toBe('');
    expect(result.current.state.values.confirm).toBe('');
  });

  it('should call mutation with currentPassword and newPassword on valid submit', async () => {
    const mutateFn = vi.fn();
    const fakeMutation = createFakeMutation(mutateFn);

    const { result } = renderHook(
      () =>
        useChangePasswordForm({
          changePasswordMutation: fakeMutation,
          handleSuccess: vi.fn(),
        }),
      { wrapper: createQueryThemeWrapper() },
    );

    act(() => {
      result.current.setFieldValue('currentPassword', 'OldPassword123!');
      result.current.setFieldValue('newPassword', 'NewPassword123!');
      result.current.setFieldValue('confirm', 'NewPassword123!');
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    await waitFor(() => {
      expect(mutateFn).toHaveBeenCalledWith(
        { currentPassword: 'OldPassword123!', newPassword: 'NewPassword123!' },
        expect.objectContaining({
          onSuccess: expect.any(Function),
          onError: expect.any(Function),
        }),
      );
    });
  });

  it('should reset form and call handleSuccess on successful mutation without error', async () => {
    const handleSuccess = vi.fn();
    const successData = { data: { status: true }, error: null };
    const fakeMutation = createFakeMutation((_variables, options) => {
      queueMicrotask(() => {
        options?.onSuccess?.(successData);
      });
    });

    const { result } = renderHook(
      () =>
        useChangePasswordForm({
          changePasswordMutation: fakeMutation,
          handleSuccess,
        }),
      { wrapper: createQueryThemeWrapper() },
    );

    act(() => {
      result.current.setFieldValue('currentPassword', 'OldPassword123!');
      result.current.setFieldValue('newPassword', 'NewPassword123!');
      result.current.setFieldValue('confirm', 'NewPassword123!');
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    await waitFor(() => {
      expect(handleSuccess).toHaveBeenCalledWith(successData);
    });

    expect(result.current.state.values.currentPassword).toBe('');
    expect(result.current.state.values.newPassword).toBe('');
    expect(result.current.state.values.confirm).toBe('');
  });

  it('should set error map when onSuccess receives data with error.message', async () => {
    const handleSuccess = vi.fn();
    const fakeMutation = createFakeMutation((_variables, options) => {
      queueMicrotask(() => {
        options?.onSuccess?.({
          data: null,
          error: { message: 'Invalid current password' },
        });
      });
    });

    const { result } = renderHook(
      () =>
        useChangePasswordForm({
          changePasswordMutation: fakeMutation,
          handleSuccess,
        }),
      { wrapper: createQueryThemeWrapper() },
    );

    act(() => {
      result.current.setFieldValue('currentPassword', 'WrongPassword!');
      result.current.setFieldValue('newPassword', 'NewPassword123!');
      result.current.setFieldValue('confirm', 'NewPassword123!');
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    await waitFor(() => {
      expect(handleSuccess).not.toHaveBeenCalled();
      expect(JSON.stringify(result.current.state.errorMap)).toContain(
        'Invalid current password',
      );
    });
  });

  it('should log error and use fallback message when onSuccess receives error without message', async () => {
    const logErrorSpy = vi
      .spyOn(loggerUtils, 'logError')
      .mockImplementation(vi.fn());
    const handleSuccess = vi.fn();
    const appError = { code: 'UNKNOWN' };
    const fakeMutation = createFakeMutation((_variables, options) => {
      queueMicrotask(() => {
        options?.onSuccess?.({
          data: null,
          error: { ...appError, message: '' },
        });
      });
    });

    const { result } = renderHook(
      () =>
        useChangePasswordForm({
          changePasswordMutation: fakeMutation,
          handleSuccess,
        }),
      { wrapper: createQueryThemeWrapper() },
    );

    act(() => {
      result.current.setFieldValue('currentPassword', 'OldPassword123!');
      result.current.setFieldValue('newPassword', 'NewPassword123!');
      result.current.setFieldValue('confirm', 'NewPassword123!');
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    await waitFor(() => {
      expect(handleSuccess).not.toHaveBeenCalled();
      expect(JSON.stringify(result.current.state.errorMap)).toContain(
        'Something went wrong, please try again later.',
      );
    });

    expect(logErrorSpy).toHaveBeenCalledWith(
      { error: { ...appError, message: '' } },
      'Change password failed',
    );

    logErrorSpy.mockRestore();
  });

  it('should set error map with message when onError receives error with message', async () => {
    const logErrorSpy = vi
      .spyOn(loggerUtils, 'logError')
      .mockImplementation(vi.fn());
    const handleSuccess = vi.fn();
    const fakeMutation = createFakeMutation((_variables, options) => {
      queueMicrotask(() => {
        options?.onError?.({ message: 'Network error' });
      });
    });

    const { result } = renderHook(
      () =>
        useChangePasswordForm({
          changePasswordMutation: fakeMutation,
          handleSuccess,
        }),
      { wrapper: createQueryThemeWrapper() },
    );

    act(() => {
      result.current.setFieldValue('currentPassword', 'OldPassword123!');
      result.current.setFieldValue('newPassword', 'NewPassword123!');
      result.current.setFieldValue('confirm', 'NewPassword123!');
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    await waitFor(() => {
      expect(handleSuccess).not.toHaveBeenCalled();
      expect(JSON.stringify(result.current.state.errorMap)).toContain(
        'Network error',
      );
    });

    expect(logErrorSpy).not.toHaveBeenCalled();
    logErrorSpy.mockRestore();
  });

  it('should log error and use fallback message when onError receives error without message', async () => {
    const logErrorSpy = vi
      .spyOn(loggerUtils, 'logError')
      .mockImplementation(vi.fn());
    const handleSuccess = vi.fn();
    const errorObj = { code: 'UNKNOWN' };
    const fakeMutation = createFakeMutation((_variables, options) => {
      queueMicrotask(() => {
        options?.onError?.(errorObj);
      });
    });

    const { result } = renderHook(
      () =>
        useChangePasswordForm({
          changePasswordMutation: fakeMutation,
          handleSuccess,
        }),
      { wrapper: createQueryThemeWrapper() },
    );

    act(() => {
      result.current.setFieldValue('currentPassword', 'OldPassword123!');
      result.current.setFieldValue('newPassword', 'NewPassword123!');
      result.current.setFieldValue('confirm', 'NewPassword123!');
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    await waitFor(() => {
      expect(handleSuccess).not.toHaveBeenCalled();
      expect(JSON.stringify(result.current.state.errorMap)).toContain(
        'Something went wrong, please try again later.',
      );
    });

    expect(logErrorSpy).toHaveBeenCalledWith(
      { error: errorObj },
      'Change password failed',
    );

    logErrorSpy.mockRestore();
  });

  it('should not submit when validation fails (mismatched passwords)', async () => {
    const mutateFn = vi.fn();
    const fakeMutation = createFakeMutation(mutateFn);

    const { result } = renderHook(
      () =>
        useChangePasswordForm({
          changePasswordMutation: fakeMutation,
          handleSuccess: vi.fn(),
        }),
      { wrapper: createQueryThemeWrapper() },
    );

    act(() => {
      result.current.setFieldValue('currentPassword', 'OldPassword123!');
      result.current.setFieldValue('newPassword', 'NewPassword123!');
      result.current.setFieldValue('confirm', 'DifferentPassword!');
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(mutateFn).not.toHaveBeenCalled();
  });

  it('should handle onError with non-object error', async () => {
    const logErrorSpy = vi
      .spyOn(loggerUtils, 'logError')
      .mockImplementation(vi.fn());
    const handleSuccess = vi.fn();
    const fakeMutation = createFakeMutation((_variables, options) => {
      queueMicrotask(() => {
        options?.onError?.('string error');
      });
    });

    const { result } = renderHook(
      () =>
        useChangePasswordForm({
          changePasswordMutation: fakeMutation,
          handleSuccess,
        }),
      { wrapper: createQueryThemeWrapper() },
    );

    act(() => {
      result.current.setFieldValue('currentPassword', 'OldPassword123!');
      result.current.setFieldValue('newPassword', 'NewPassword123!');
      result.current.setFieldValue('confirm', 'NewPassword123!');
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    await waitFor(() => {
      expect(handleSuccess).not.toHaveBeenCalled();
      expect(JSON.stringify(result.current.state.errorMap)).toContain(
        'Something went wrong, please try again later.',
      );
    });

    expect(logErrorSpy).toHaveBeenCalledWith(
      { error: 'string error' },
      'Change password failed',
    );

    logErrorSpy.mockRestore();
  });
});
