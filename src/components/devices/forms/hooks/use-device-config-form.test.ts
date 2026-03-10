import { useDeviceConfigForm } from '@components/devices/forms/hooks/use-device-config-form';
import * as loggerUtils from '@lib/logger.utils';
import { createQueryThemeWrapper } from '@lib/test-wrappers.utils';
import type { useUpdateDeviceConfigMutationType } from '@services/terminal/update-device-config.http-service';
import { act, renderHook, waitFor } from '@testing-library/react';

const MS_PER_MINUTE = 60 * 1000;
const MS_PER_HOUR = 60 * 60 * 1000;

function createSuccessMutation(
  data: unknown,
): useUpdateDeviceConfigMutationType {
  return {
    mutate: vi.fn((_, options) => {
      options?.onSuccess?.(data as never, undefined as never, undefined);
    }),
  } as unknown as useUpdateDeviceConfigMutationType;
}

function createErrorMutation(error: {
  responseErrors?: Record<string, string[]> | null;
}): useUpdateDeviceConfigMutationType {
  return {
    mutate: vi.fn((_, options) => {
      options?.onError?.(error as never, undefined as never, undefined);
    }),
  } as unknown as useUpdateDeviceConfigMutationType;
}

describe('useDeviceConfigForm', () => {
  it('should initialize with default values', () => {
    const mockMutation = {
      mutate: vi.fn(),
    } as unknown as useUpdateDeviceConfigMutationType;

    const { result } = renderHook(
      () =>
        useDeviceConfigForm({
          updateConfigMutation: mockMutation,
          organizationId: 'org-1',
          deviceId: 1,
          defaultValues: {
            inactivityTimeoutMinutes: 30,
            hardCapHours: 4,
            defaultWorkingDirectory: '/home/user',
          },
          handleSuccess: vi.fn(),
        }),
      { wrapper: createQueryThemeWrapper() },
    );

    expect(result.current.state.values.inactivityTimeoutMinutes).toBe(30);
    expect(result.current.state.values.hardCapHours).toBe(4);
    expect(result.current.state.values.defaultWorkingDirectory).toBe(
      '/home/user',
    );
  });

  it('should submit with converted ms values and working directory', async () => {
    const mockData = {
      responseData: { results: { inactivityTimeoutMs: 1_800_000 } },
      responseErrors: null,
    };
    const mockMutation = createSuccessMutation(mockData);
    const mockHandleSuccess = vi.fn();

    const { result } = renderHook(
      () =>
        useDeviceConfigForm({
          updateConfigMutation: mockMutation,
          organizationId: 'org-1',
          deviceId: 42,
          defaultValues: {
            inactivityTimeoutMinutes: 30,
            hardCapHours: 2,
            defaultWorkingDirectory: '/opt/app',
          },
          handleSuccess: mockHandleSuccess,
        }),
      { wrapper: createQueryThemeWrapper() },
    );

    await act(async () => {
      await result.current.handleSubmit();
    });

    await waitFor(() => {
      expect(mockMutation.mutate).toHaveBeenCalledWith(
        {
          params: { path: { organizationId: 'org-1', deviceId: 42 } },
          body: {
            inactivityTimeoutMs: 30 * MS_PER_MINUTE,
            hardCapMs: 2 * MS_PER_HOUR,
            defaultWorkingDirectory: '/opt/app',
          },
        },
        expect.any(Object),
      );
      expect(mockHandleSuccess).toHaveBeenCalled();
    });
  });

  it('should convert empty hardCapHours and empty directory to null', async () => {
    const mockData = {
      responseData: { results: { inactivityTimeoutMs: 3_600_000 } },
      responseErrors: null,
    };
    const mockMutation = createSuccessMutation(mockData);

    const { result } = renderHook(
      () =>
        useDeviceConfigForm({
          updateConfigMutation: mockMutation,
          organizationId: 'org-1',
          deviceId: 1,
          defaultValues: {
            inactivityTimeoutMinutes: 60,
            hardCapHours: '',
            defaultWorkingDirectory: '',
          },
          handleSuccess: vi.fn(),
        }),
      { wrapper: createQueryThemeWrapper() },
    );

    await act(async () => {
      await result.current.handleSubmit();
    });

    await waitFor(() => {
      expect(mockMutation.mutate).toHaveBeenCalledWith(
        expect.objectContaining({
          body: {
            inactivityTimeoutMs: 60 * MS_PER_MINUTE,
            hardCapMs: null,
            defaultWorkingDirectory: null,
          },
        }),
        expect.any(Object),
      );
    });
  });

  it('should handle API errors', async () => {
    vi.spyOn(loggerUtils, 'logError').mockImplementation(vi.fn());
    const mockMutation = createErrorMutation({
      responseErrors: null,
    });
    const mockHandleSuccess = vi.fn();

    const { result } = renderHook(
      () =>
        useDeviceConfigForm({
          updateConfigMutation: mockMutation,
          organizationId: 'org-1',
          deviceId: 1,
          defaultValues: {
            inactivityTimeoutMinutes: 30,
            hardCapHours: '',
            defaultWorkingDirectory: '',
          },
          handleSuccess: mockHandleSuccess,
        }),
      { wrapper: createQueryThemeWrapper() },
    );

    await act(async () => {
      await result.current.handleSubmit();
    });

    await waitFor(() => {
      expect(mockHandleSuccess).not.toHaveBeenCalled();
    });
  });

  it('should allow field values to be updated', () => {
    const mockMutation = {
      mutate: vi.fn(),
    } as unknown as useUpdateDeviceConfigMutationType;

    const { result } = renderHook(
      () =>
        useDeviceConfigForm({
          updateConfigMutation: mockMutation,
          organizationId: 'org-1',
          deviceId: 1,
          defaultValues: {
            inactivityTimeoutMinutes: 30,
            hardCapHours: '',
            defaultWorkingDirectory: '',
          },
          handleSuccess: vi.fn(),
        }),
      { wrapper: createQueryThemeWrapper() },
    );

    act(() => {
      result.current.setFieldValue('inactivityTimeoutMinutes', 120);
      result.current.setFieldValue('hardCapHours', 8);
      result.current.setFieldValue('defaultWorkingDirectory', '/var/log');
    });

    expect(result.current.state.values.inactivityTimeoutMinutes).toBe(120);
    expect(result.current.state.values.hardCapHours).toBe(8);
    expect(result.current.state.values.defaultWorkingDirectory).toBe(
      '/var/log',
    );
  });
});
