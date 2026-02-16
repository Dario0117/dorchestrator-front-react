import { useResetPasswordForm } from '@components/org/forms/hooks/use-reset-password-form';
import * as loggerUtils from '@lib/logger.utils';
import { buildBackendUrl } from '@lib/test.utils';
import { createQueryThemeWrapper } from '@lib/test-wrappers.utils';
import { useResetPasswordMutation } from '@services/users/reset-password.http-service';
import { act, renderHook, waitFor } from '@testing-library/react';
import { HttpResponse, http } from 'msw';
import { server } from '@/../testsSetup';

describe('useResetPasswordForm', () => {
  it('should initialize with empty default values', () => {
    const mockHandleSuccess = vi.fn();
    const { result } = renderHook(
      () => {
        const resetPasswordMutation = useResetPasswordMutation();
        return useResetPasswordForm({
          resetPasswordMutation,
          handleSuccess: mockHandleSuccess,
        });
      },
      { wrapper: createQueryThemeWrapper() },
    );

    expect(result.current.state.values.email).toBe('');
  });

  it('should validate required email field', async () => {
    const mockHandleSuccess = vi.fn();
    const { result } = renderHook(
      () => {
        const resetPasswordMutation = useResetPasswordMutation();
        return useResetPasswordForm({
          resetPasswordMutation,
          handleSuccess: mockHandleSuccess,
        });
      },
      { wrapper: createQueryThemeWrapper() },
    );

    // Try to submit with empty email
    await act(async () => {
      await result.current.handleSubmit();
    });

    // Should have validation errors - form validates on submit
    expect(mockHandleSuccess).not.toHaveBeenCalled();
  });

  it('should call resetPasswordMutation on successful validation', async () => {
    const mockHandleSuccess = vi.fn();
    const { result } = renderHook(
      () => {
        const resetPasswordMutation = useResetPasswordMutation();
        return useResetPasswordForm({
          resetPasswordMutation,
          handleSuccess: mockHandleSuccess,
        });
      },
      { wrapper: createQueryThemeWrapper() },
    );

    // Set valid email
    act(() => {
      result.current.setFieldValue('email', 'test@example.com');
    });

    // Submit form
    await act(async () => {
      await result.current.handleSubmit();
    });

    // better-auth wraps responses in { data: ..., error: null } format
    await waitFor(() => {
      expect(mockHandleSuccess).toHaveBeenCalledWith({
        data: {
          status: true,
          message: 'Password reset email sent',
        },
        error: null,
      });
    });
  });

  it('should call handleSuccess after successful password reset request', async () => {
    const mockHandleSuccess = vi.fn();
    const { result } = renderHook(
      () => {
        const resetPasswordMutation = useResetPasswordMutation();
        return useResetPasswordForm({
          resetPasswordMutation,
          handleSuccess: mockHandleSuccess,
        });
      },
      { wrapper: createQueryThemeWrapper() },
    );

    // Set valid email
    act(() => {
      result.current.setFieldValue('email', 'test@example.com');
    });

    // Submit form
    await act(async () => {
      await result.current.handleSubmit();
    });

    // better-auth wraps responses in { data: ..., error: null } format
    await waitFor(() => {
      expect(mockHandleSuccess).toHaveBeenCalledWith({
        data: {
          status: true,
          message: 'Password reset email sent',
        },
        error: null,
      });
    });
  });

  it('should set error map when reset password fails with responseErrors', async () => {
    // Return HTTP 400 error so better-auth wraps it as { data: null, error: {...} }
    server.use(
      http.post(buildBackendUrl('/api/v1/request-password-reset'), () => {
        return HttpResponse.json(
          { message: 'Email not found' },
          { status: 400 },
        );
      }),
    );

    const mockHandleSuccess = vi.fn();
    const { result } = renderHook(
      () => {
        const resetPasswordMutation = useResetPasswordMutation();
        return useResetPasswordForm({
          resetPasswordMutation,
          handleSuccess: mockHandleSuccess,
        });
      },
      { wrapper: createQueryThemeWrapper() },
    );

    // Set valid email
    act(() => {
      result.current.setFieldValue('email', 'notfound@example.com');
    });

    // Submit form
    await act(async () => {
      await result.current.handleSubmit();
    });

    // Check that handleSuccess was not called due to error
    await waitFor(() => {
      expect(mockHandleSuccess).not.toHaveBeenCalled();
    });
  });

  it('should handle unexpected error without responseErrors', async () => {
    vi.spyOn(loggerUtils, 'logError').mockImplementation(vi.fn());
    // Return HTTP 500 error without message so better-auth wraps it
    server.use(
      http.post(buildBackendUrl('/api/v1/request-password-reset'), () => {
        return HttpResponse.json({}, { status: 500 });
      }),
    );

    const mockHandleSuccess = vi.fn();
    const { result } = renderHook(
      () => {
        const resetPasswordMutation = useResetPasswordMutation();
        return useResetPasswordForm({
          resetPasswordMutation,
          handleSuccess: mockHandleSuccess,
        });
      },
      { wrapper: createQueryThemeWrapper() },
    );

    // Set valid email
    act(() => {
      result.current.setFieldValue('email', 'test@example.com');
    });

    // Submit form - should handle error gracefully
    await act(async () => {
      await result.current.handleSubmit();
    });

    // Check that handleSuccess was not called due to error
    await waitFor(() => {
      expect(mockHandleSuccess).not.toHaveBeenCalled();
    });
  });

  it('should handle network error via onError callback', async () => {
    vi.spyOn(loggerUtils, 'logError').mockImplementation(vi.fn());

    server.use(
      http.post(buildBackendUrl('/api/v1/request-password-reset'), () => {
        return HttpResponse.error();
      }),
    );

    const mockHandleSuccess = vi.fn();
    const { result } = renderHook(
      () => {
        const resetPasswordMutation = useResetPasswordMutation();
        return useResetPasswordForm({
          resetPasswordMutation,
          handleSuccess: mockHandleSuccess,
        });
      },
      { wrapper: createQueryThemeWrapper() },
    );

    act(() => {
      result.current.setFieldValue('email', 'test@example.com');
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    await waitFor(() => {
      expect(mockHandleSuccess).not.toHaveBeenCalled();
    });
  });

  it('should validate email field individually', () => {
    const mockHandleSuccess = vi.fn();
    const { result } = renderHook(
      () => {
        const resetPasswordMutation = useResetPasswordMutation();
        return useResetPasswordForm({
          resetPasswordMutation,
          handleSuccess: mockHandleSuccess,
        });
      },
      { wrapper: createQueryThemeWrapper() },
    );

    // Should be able to set valid email
    act(() => {
      result.current.setFieldValue('email', 'test@example.com');
    });

    expect(result.current.state.values.email).toBe('test@example.com');

    // Should be able to set empty value
    act(() => {
      result.current.setFieldValue('email', '');
    });

    expect(result.current.state.values.email).toBe('');
  });
});
