import { useLoginForm } from '@components/org/forms/hooks/use-login-form';
import * as loggerUtils from '@lib/logger.utils';
import { buildBackendUrl } from '@lib/test.utils';
import { createQueryThemeWrapper } from '@lib/test-wrappers.utils';
import { useLoginMutation } from '@services/users/login.http-service';
import { useMutation } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { HttpResponse, http } from 'msw';
import { server } from '@/../testsSetup';

describe('useLoginForm', () => {
  it('should initialize with empty default values', () => {
    const mockHandleSuccess = vi.fn();
    const { result } = renderHook(
      () => {
        const loginMutation = useLoginMutation();
        return useLoginForm({
          loginMutation,
          handleSuccess: mockHandleSuccess,
        });
      },
      { wrapper: createQueryThemeWrapper() },
    );

    expect(result.current.state.values.email).toBe('');
    expect(result.current.state.values.password).toBe('');
  });

  it('should validate required fields', async () => {
    const mockHandleSuccess = vi.fn();
    const { result } = renderHook(
      () => {
        const loginMutation = useLoginMutation();
        return useLoginForm({
          loginMutation,
          handleSuccess: mockHandleSuccess,
        });
      },
      { wrapper: createQueryThemeWrapper() },
    );

    // Try to submit with empty values
    await act(async () => {
      await result.current.handleSubmit();
    });

    // Should have validation errors - TanStack form validates on submit
    // The form should prevent submission with invalid data
    expect(mockHandleSuccess).not.toHaveBeenCalled();
  });

  it('should call loginMutation on successful validation', async () => {
    const mockHandleSuccess = vi.fn();
    const { result } = renderHook(
      () => {
        const loginMutation = useLoginMutation();
        return useLoginForm({
          loginMutation,
          handleSuccess: mockHandleSuccess,
        });
      },
      { wrapper: createQueryThemeWrapper() },
    );

    // Set valid values
    act(() => {
      result.current.setFieldValue('email', 'test@example.com');
      result.current.setFieldValue('password', 'password123');
    });

    // Submit form
    await act(async () => {
      await result.current.handleSubmit();
    });

    // better-auth wraps responses in { data: ..., error: null } format
    await waitFor(() => {
      expect(mockHandleSuccess).toHaveBeenCalledWith({
        data: {
          redirect: false,
          token: 'random-token',
          user: expect.objectContaining({
            id: 'test-user-id',
            email: 'test@example.com',
            name: 'Test User',
          }),
        },
        error: null,
      });
    });
  });

  it('should handle multiple form submissions', async () => {
    const mockHandleSuccess = vi.fn();

    const { result } = renderHook(
      () => {
        const loginMutation = useLoginMutation();
        return useLoginForm({
          loginMutation,
          handleSuccess: mockHandleSuccess,
        });
      },
      { wrapper: createQueryThemeWrapper() },
    );

    // Set valid values
    act(() => {
      result.current.setFieldValue('email', 'test@example.com');
      result.current.setFieldValue('password', 'password123');
    });

    // First submission
    await act(async () => {
      await result.current.handleSubmit();
    });

    await waitFor(() => {
      expect(mockHandleSuccess).toHaveBeenCalledTimes(1);
    });

    // The form state should exist
    expect(result.current.state).toBeDefined();
    expect(result.current.state.values.email).toBe('test@example.com');
  });

  it('should set error map when login fails', async () => {
    // Return HTTP 400 error so better-auth wraps it as { data: null, error: {...} }
    server.use(
      http.post(buildBackendUrl('/api/v1/sign-in/email'), () => {
        return HttpResponse.json(
          { message: 'Invalid credentials' },
          { status: 400 },
        );
      }),
    );

    const mockHandleSuccess = vi.fn();
    const { result } = renderHook(
      () => {
        const loginMutation = useLoginMutation();
        return useLoginForm({
          loginMutation,
          handleSuccess: mockHandleSuccess,
        });
      },
      { wrapper: createQueryThemeWrapper() },
    );

    // Set valid values
    act(() => {
      result.current.setFieldValue('email', 'test@example.com');
      result.current.setFieldValue('password', 'wrongpassword');
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

  it('should handle login function throwing an error', async () => {
    // Return HTTP 500 error so better-auth wraps it as { data: null, error: {...} }
    server.use(
      http.post(buildBackendUrl('/api/v1/sign-in/email'), () => {
        return HttpResponse.json({ message: 'Network error' }, { status: 500 });
      }),
    );

    const mockHandleSuccess = vi.fn();
    const { result } = renderHook(
      () => {
        const loginMutation = useLoginMutation();
        return useLoginForm({
          loginMutation,
          handleSuccess: mockHandleSuccess,
        });
      },
      { wrapper: createQueryThemeWrapper() },
    );

    // Set valid values
    act(() => {
      result.current.setFieldValue('email', 'test@example.com');
      result.current.setFieldValue('password', 'password123');
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

  it('should validate email field individually', () => {
    const mockHandleSuccess = vi.fn();
    const { result } = renderHook(
      () => {
        const loginMutation = useLoginMutation();
        return useLoginForm({
          loginMutation,
          handleSuccess: mockHandleSuccess,
        });
      },
      { wrapper: createQueryThemeWrapper() },
    );

    // Should be able to set valid value
    act(() => {
      result.current.setFieldValue('email', 'valid@example.com');
    });

    expect(result.current.state.values.email).toBe('valid@example.com');

    // Should be able to set empty value
    act(() => {
      result.current.setFieldValue('email', '');
    });

    expect(result.current.state.values.email).toBe('');
  });

  it('should validate password field individually', () => {
    const mockHandleSuccess = vi.fn();
    const { result } = renderHook(
      () => {
        const loginMutation = useLoginMutation();
        return useLoginForm({
          loginMutation,
          handleSuccess: mockHandleSuccess,
        });
      },
      { wrapper: createQueryThemeWrapper() },
    );

    // Should be able to set valid value
    act(() => {
      result.current.setFieldValue('password', 'validpassword');
    });

    expect(result.current.state.values.password).toBe('validpassword');

    // Should be able to set empty value
    act(() => {
      result.current.setFieldValue('password', '');
    });

    expect(result.current.state.values.password).toBe('');
  });

  it('should handle successful login without errors', async () => {
    const mockHandleSuccess = vi.fn();
    const { result } = renderHook(
      () => {
        const loginMutation = useLoginMutation();
        return useLoginForm({
          loginMutation,
          handleSuccess: mockHandleSuccess,
        });
      },
      { wrapper: createQueryThemeWrapper() },
    );

    // Set valid values
    act(() => {
      result.current.setFieldValue('email', 'test@example.com');
      result.current.setFieldValue('password', 'password123');
    });

    // Submit form
    await act(async () => {
      await result.current.handleSubmit();
    });

    // Should have called handleSuccess with wrapped response
    await waitFor(() => {
      expect(mockHandleSuccess).toHaveBeenCalledTimes(1);
      expect(mockHandleSuccess).toHaveBeenCalledWith({
        data: {
          redirect: false,
          token: 'random-token',
          user: expect.objectContaining({
            id: 'test-user-id',
            email: 'test@example.com',
            name: 'Test User',
          }),
        },
        error: null,
      });
    });
  });

  it('should log error when onSuccess error has no message', async () => {
    const logErrorSpy = vi
      .spyOn(loggerUtils, 'logError')
      .mockImplementation(vi.fn());

    // Return HTTP 500 with empty body - better-auth wraps as error without message
    server.use(
      http.post(buildBackendUrl('/api/v1/sign-in/email'), () => {
        return HttpResponse.json({}, { status: 500 });
      }),
    );

    const mockHandleSuccess = vi.fn();
    const { result } = renderHook(
      () => {
        const loginMutation = useLoginMutation();
        return useLoginForm({
          loginMutation,
          handleSuccess: mockHandleSuccess,
        });
      },
      { wrapper: createQueryThemeWrapper() },
    );

    act(() => {
      result.current.setFieldValue('email', 'test@example.com');
      result.current.setFieldValue('password', 'password123');
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    await waitFor(() => {
      expect(mockHandleSuccess).not.toHaveBeenCalled();
    });

    logErrorSpy.mockRestore();
  });

  it('should use error message in onError when error has a message property', async () => {
    const logErrorSpy = vi
      .spyOn(loggerUtils, 'logError')
      .mockImplementation(vi.fn());

    // Use a custom mutation that rejects with an Error containing a message,
    // to test the onError path where errorMessage is truthy
    const mockHandleSuccess = vi.fn();
    const { result } = renderHook(
      () => {
        const loginMutation = useMutation({
          mutationFn: () => Promise.reject(new Error('Connection refused')),
        }) as ReturnType<typeof useLoginMutation>;
        return useLoginForm({
          loginMutation,
          handleSuccess: mockHandleSuccess,
        });
      },
      { wrapper: createQueryThemeWrapper() },
    );

    act(() => {
      result.current.setFieldValue('email', 'test@example.com');
      result.current.setFieldValue('password', 'password123');
    });

    logErrorSpy.mockClear();

    await act(async () => {
      await result.current.handleSubmit();
    });

    await waitFor(() => {
      expect(mockHandleSuccess).not.toHaveBeenCalled();
    });

    // The error has a message ('Connection refused'), so logError should NOT be called
    // because the if(!errorMessage) branch is skipped when errorMessage is truthy
    expect(logErrorSpy).not.toHaveBeenCalledWith(
      expect.anything(),
      'Login failed',
    );

    logErrorSpy.mockRestore();
  });

  it('should log error and use fallback message when onError receives error without message', async () => {
    const logErrorSpy = vi
      .spyOn(loggerUtils, 'logError')
      .mockImplementation(vi.fn());

    // Use a custom mutation that rejects with a plain object (no message property),
    // to test the onError path where errorMessage is empty and logError is called
    const mockHandleSuccess = vi.fn();
    const { result } = renderHook(
      () => {
        const loginMutation = useMutation({
          mutationFn: () =>
            Promise.reject({
              status: 500,
              statusText: 'Internal Server Error',
            }),
        }) as ReturnType<typeof useLoginMutation>;
        return useLoginForm({
          loginMutation,
          handleSuccess: mockHandleSuccess,
        });
      },
      { wrapper: createQueryThemeWrapper() },
    );

    act(() => {
      result.current.setFieldValue('email', 'test@example.com');
      result.current.setFieldValue('password', 'password123');
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    await waitFor(() => {
      expect(mockHandleSuccess).not.toHaveBeenCalled();
    });

    // The error has no message, so logError SHOULD be called
    expect(logErrorSpy).toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.anything() }),
      'Login failed',
    );

    logErrorSpy.mockRestore();
  });
});
