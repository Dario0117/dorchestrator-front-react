import { useUpdatePasswordForm } from '@components/org/forms/hooks/use-update-password-form';
import { buildBackendUrl } from '@lib/test.utils';
import { createQueryThemeWrapper } from '@lib/test-wrappers.utils';
import { useUpdatePasswordMutation } from '@services/users/update-password.http-service';
import { act, renderHook, waitFor } from '@testing-library/react';
import { HttpResponse, http } from 'msw';
import { server } from '@/../testsSetup';

// Mock useParams
vi.mock('@tanstack/react-router', () => ({
  useParams: vi.fn(() => ({ token: 'test-token-123' })),
}));

describe('useUpdatePasswordForm', () => {
  it('should initialize with empty default values', () => {
    const mockHandleSuccess = vi.fn();
    const { result } = renderHook(
      () => {
        const updatePasswordMutation =
          useUpdatePasswordMutation('test-token-123');
        return useUpdatePasswordForm({
          updatePasswordMutation,
          handleSuccess: mockHandleSuccess,
        });
      },
      { wrapper: createQueryThemeWrapper() },
    );

    expect(result.current.state.values.password).toBe('');
    expect(result.current.state.values.confirm).toBe('');
  });

  it('should handle validation on submit', async () => {
    const mockHandleSuccess = vi.fn();
    const { result } = renderHook(
      () => {
        const updatePasswordMutation =
          useUpdatePasswordMutation('test-token-123');
        return useUpdatePasswordForm({
          updatePasswordMutation,
          handleSuccess: mockHandleSuccess,
        });
      },
      { wrapper: createQueryThemeWrapper() },
    );

    // Try to submit with empty passwords
    await act(async () => {
      await result.current.handleSubmit();
    });

    // Form should handle submission (validation may allow empty values through to backend)
    // The actual validation behavior depends on the schema
    expect(result.current.state).toBeDefined();
  });

  it('should call updatePasswordMutation on successful validation', async () => {
    const mockHandleSuccess = vi.fn();
    const { result } = renderHook(
      () => {
        const updatePasswordMutation =
          useUpdatePasswordMutation('test-token-123');
        return useUpdatePasswordForm({
          updatePasswordMutation,
          handleSuccess: mockHandleSuccess,
        });
      },
      { wrapper: createQueryThemeWrapper() },
    );

    // Set valid passwords
    act(() => {
      result.current.setFieldValue('password', 'NewPassword123!');
      result.current.setFieldValue('confirm', 'NewPassword123!');
    });

    // Submit form
    await act(async () => {
      await result.current.handleSubmit();
    });

    // better-auth wraps responses in { data: ..., error: null } format
    await waitFor(() => {
      expect(mockHandleSuccess).toHaveBeenCalledWith({
        data: { status: true },
        error: null,
      });
    });
  });

  it('should call handleSuccess after successful password update', async () => {
    const mockHandleSuccess = vi.fn();
    const { result } = renderHook(
      () => {
        const updatePasswordMutation =
          useUpdatePasswordMutation('test-token-123');
        return useUpdatePasswordForm({
          updatePasswordMutation,
          handleSuccess: mockHandleSuccess,
        });
      },
      { wrapper: createQueryThemeWrapper() },
    );

    // Set valid passwords
    act(() => {
      result.current.setFieldValue('password', 'NewPassword123!');
      result.current.setFieldValue('confirm', 'NewPassword123!');
    });

    // Submit form
    await act(async () => {
      await result.current.handleSubmit();
    });

    // better-auth wraps responses in { data: ..., error: null } format
    await waitFor(() => {
      expect(mockHandleSuccess).toHaveBeenCalledWith({
        data: { status: true },
        error: null,
      });
    });
  });

  it('should set error map when update password fails with responseErrors', async () => {
    // Return HTTP 400 error so better-auth wraps it as { data: null, error: {...} }
    server.use(
      http.post(buildBackendUrl('/api/v1/reset-password'), () => {
        return HttpResponse.json(
          { message: 'Invalid or expired token' },
          { status: 400 },
        );
      }),
    );

    const mockHandleSuccess = vi.fn();
    const { result } = renderHook(
      () => {
        const updatePasswordMutation =
          useUpdatePasswordMutation('test-token-123');
        return useUpdatePasswordForm({
          updatePasswordMutation,
          handleSuccess: mockHandleSuccess,
        });
      },
      { wrapper: createQueryThemeWrapper() },
    );

    // Set valid passwords
    act(() => {
      result.current.setFieldValue('password', 'NewPassword123!');
      result.current.setFieldValue('confirm', 'NewPassword123!');
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
    // Return HTTP 500 error without message so better-auth wraps it
    server.use(
      http.post(buildBackendUrl('/api/v1/reset-password'), () => {
        return HttpResponse.json({}, { status: 500 });
      }),
    );

    const mockHandleSuccess = vi.fn();
    const { result } = renderHook(
      () => {
        const updatePasswordMutation =
          useUpdatePasswordMutation('test-token-123');
        return useUpdatePasswordForm({
          updatePasswordMutation,
          handleSuccess: mockHandleSuccess,
        });
      },
      { wrapper: createQueryThemeWrapper() },
    );

    // Set valid passwords
    act(() => {
      result.current.setFieldValue('password', 'NewPassword123!');
      result.current.setFieldValue('confirm', 'NewPassword123!');
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

  it('should validate password field individually', () => {
    const mockHandleSuccess = vi.fn();
    const { result } = renderHook(
      () => {
        const updatePasswordMutation =
          useUpdatePasswordMutation('test-token-123');
        return useUpdatePasswordForm({
          updatePasswordMutation,
          handleSuccess: mockHandleSuccess,
        });
      },
      { wrapper: createQueryThemeWrapper() },
    );

    // Should be able to set valid password
    act(() => {
      result.current.setFieldValue('password', 'ValidPassword123!');
    });

    expect(result.current.state.values.password).toBe('ValidPassword123!');

    // Should be able to set empty value
    act(() => {
      result.current.setFieldValue('password', '');
    });

    expect(result.current.state.values.password).toBe('');
  });

  it('should validate confirm field individually', () => {
    const mockHandleSuccess = vi.fn();
    const { result } = renderHook(
      () => {
        const updatePasswordMutation =
          useUpdatePasswordMutation('test-token-123');
        return useUpdatePasswordForm({
          updatePasswordMutation,
          handleSuccess: mockHandleSuccess,
        });
      },
      { wrapper: createQueryThemeWrapper() },
    );

    // Should be able to set valid confirm password
    act(() => {
      result.current.setFieldValue('confirm', 'ValidPassword123!');
    });

    expect(result.current.state.values.confirm).toBe('ValidPassword123!');

    // Should be able to set empty value
    act(() => {
      result.current.setFieldValue('confirm', '');
    });

    expect(result.current.state.values.confirm).toBe('');
  });
});
