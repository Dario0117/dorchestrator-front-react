import { useRegisterForm } from '@components/org/forms/hooks/use-register-form';
import * as loggerUtils from '@lib/logger.utils';
import { buildBackendUrl } from '@lib/test.utils';
import { createQueryThemeWrapper } from '@lib/test-wrappers.utils';
import { useRegisterMutation } from '@services/users/register.http-service';
import { renderHook, waitFor } from '@testing-library/react';
import { HttpResponse, http } from 'msw';
import { act } from 'react';
import { server } from '@/../testsSetup';

describe('useRegisterForm', () => {
  const mockHandleSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(
      () => {
        const registerMutation = useRegisterMutation();
        return useRegisterForm({
          registerMutation,
          handleSuccess: mockHandleSuccess,
        });
      },
      { wrapper: createQueryThemeWrapper() },
    );

    expect(result.current.state.values).toEqual({
      name: '',
      password: '',
      confirm: '',
      email: '',
    });
  });

  it('should call mutation with correct data on successful submission', async () => {
    const { result } = renderHook(
      () => {
        const registerMutation = useRegisterMutation();
        return useRegisterForm({
          registerMutation,
          handleSuccess: mockHandleSuccess,
        });
      },
      { wrapper: createQueryThemeWrapper() },
    );

    // Set form values
    act(() => {
      result.current.setFieldValue('name', 'Test User');
      result.current.setFieldValue('email', 'test@example.com');
      result.current.setFieldValue('password', 'password123');
      result.current.setFieldValue('confirm', 'password123');
    });

    // Submit form
    await act(async () => {
      await result.current.handleSubmit();
    });

    // better-auth wraps responses in { data: ..., error: null } format
    await waitFor(() => {
      expect(mockHandleSuccess).toHaveBeenCalledWith({
        data: {
          user: expect.objectContaining({
            id: 'test-user-id',
            email: 'test@example.com',
            name: 'Test User',
          }),
          token: null,
        },
        error: null,
      });
    });
  });

  it('should handle validation errors from server response', async () => {
    // Return HTTP 400 error so better-auth wraps it as { data: null, error: {...} }
    server.use(
      http.post(buildBackendUrl('/api/v1/sign-up/email'), () => {
        return HttpResponse.json(
          { message: 'Registration failed' },
          { status: 400 },
        );
      }),
    );

    const { result } = renderHook(
      () => {
        const registerMutation = useRegisterMutation();
        return useRegisterForm({
          registerMutation,
          handleSuccess: mockHandleSuccess,
        });
      },
      { wrapper: createQueryThemeWrapper() },
    );

    // Set form values
    act(() => {
      result.current.setFieldValue('name', 'Test User');
      result.current.setFieldValue('email', 'test@example.com');
      result.current.setFieldValue('password', 'password123');
      result.current.setFieldValue('confirm', 'password123');
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

  it('should handle unexpected errors and log them', async () => {
    vi.spyOn(loggerUtils, 'logError').mockImplementation(vi.fn());
    // Return HTTP 500 error without message so better-auth wraps it
    server.use(
      http.post(buildBackendUrl('/api/v1/sign-up/email'), () => {
        return HttpResponse.json({}, { status: 500 });
      }),
    );

    const { result } = renderHook(
      () => {
        const registerMutation = useRegisterMutation();
        return useRegisterForm({
          registerMutation,
          handleSuccess: mockHandleSuccess,
        });
      },
      { wrapper: createQueryThemeWrapper() },
    );

    // Set form values
    act(() => {
      result.current.setFieldValue('name', 'Test User');
      result.current.setFieldValue('email', 'test@example.com');
      result.current.setFieldValue('password', 'password123');
      result.current.setFieldValue('confirm', 'password123');
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

  it('should handle errors without message property', async () => {
    vi.spyOn(loggerUtils, 'logError').mockImplementation(vi.fn());
    // Return HTTP 500 error without message so better-auth wraps it
    server.use(
      http.post(buildBackendUrl('/api/v1/sign-up/email'), () => {
        return HttpResponse.json({}, { status: 500 });
      }),
    );

    const { result } = renderHook(
      () => {
        const registerMutation = useRegisterMutation();
        return useRegisterForm({
          registerMutation,
          handleSuccess: mockHandleSuccess,
        });
      },
      { wrapper: createQueryThemeWrapper() },
    );

    // Set form values
    act(() => {
      result.current.setFieldValue('name', 'Test User');
      result.current.setFieldValue('email', 'test@example.com');
      result.current.setFieldValue('password', 'password123');
      result.current.setFieldValue('confirm', 'password123');
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

  it('should successfully submit with valid data', async () => {
    const { result } = renderHook(
      () => {
        const registerMutation = useRegisterMutation();
        return useRegisterForm({
          registerMutation,
          handleSuccess: mockHandleSuccess,
        });
      },
      { wrapper: createQueryThemeWrapper() },
    );

    // Set form values
    act(() => {
      result.current.setFieldValue('name', 'Test User');
      result.current.setFieldValue('email', 'test@example.com');
      result.current.setFieldValue('password', 'password123');
      result.current.setFieldValue('confirm', 'password123');
    });

    // Submit form
    await act(async () => {
      await result.current.handleSubmit();
    });

    // Verify that handleSuccess was called with wrapped response
    await waitFor(() => {
      expect(mockHandleSuccess).toHaveBeenCalledWith({
        data: {
          user: expect.objectContaining({
            id: 'test-user-id',
            email: 'test@example.com',
            name: 'Test User',
          }),
          token: null,
        },
        error: null,
      });
    });
  });

  it('should handle network error via onError callback', async () => {
    vi.spyOn(loggerUtils, 'logError').mockImplementation(vi.fn());

    server.use(
      http.post(buildBackendUrl('/api/v1/sign-up/email'), () => {
        return HttpResponse.error();
      }),
    );

    const { result } = renderHook(
      () => {
        const registerMutation = useRegisterMutation();
        return useRegisterForm({
          registerMutation,
          handleSuccess: mockHandleSuccess,
        });
      },
      { wrapper: createQueryThemeWrapper() },
    );

    act(() => {
      result.current.setFieldValue('name', 'Test User');
      result.current.setFieldValue('email', 'test@example.com');
      result.current.setFieldValue('password', 'password123');
      result.current.setFieldValue('confirm', 'password123');
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    await waitFor(() => {
      expect(mockHandleSuccess).not.toHaveBeenCalled();
    });
  });

  it('should only include username, email, and password in request body', async () => {
    const { result } = renderHook(
      () => {
        const registerMutation = useRegisterMutation();
        return useRegisterForm({
          registerMutation,
          handleSuccess: mockHandleSuccess,
        });
      },
      { wrapper: createQueryThemeWrapper() },
    );

    // Set form values including confirm password
    act(() => {
      result.current.setFieldValue('name', 'Test User');
      result.current.setFieldValue('email', 'test@example.com');
      result.current.setFieldValue('password', 'password123');
      result.current.setFieldValue('confirm', 'password123');
    });

    // Submit form
    await act(async () => {
      await result.current.handleSubmit();
    });

    // Verify handleSuccess was called with wrapped response
    await waitFor(() => {
      expect(mockHandleSuccess).toHaveBeenCalledWith({
        data: {
          user: expect.objectContaining({
            id: 'test-user-id',
            email: 'test@example.com',
            name: 'Test User',
          }),
          token: null,
        },
        error: null,
      });
    });
  });
});
