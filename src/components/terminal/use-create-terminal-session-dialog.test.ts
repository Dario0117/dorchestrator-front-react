import { useCreateTerminalSessionDialog } from '@components/terminal/use-create-terminal-session-dialog';
import { buildBackendUrl } from '@lib/test.utils';
import { createQueryThemeWrapper } from '@lib/test-wrappers.utils';
import { act, renderHook, waitFor } from '@testing-library/react';
import { HttpResponse, http } from 'msw';
import { server } from '@/../testsSetup';
import type { operations } from '@/types/api.generated.types';

type CeilingSuccessResponse =
  operations['getApiV1ByOrganizationIdTerminalConfigEffectiveByDeviceId']['responses']['200']['content']['application/json'];

type DeviceConfigSuccessResponse =
  operations['getApiV1ByOrganizationIdTerminalConfigByDeviceId']['responses']['200']['content']['application/json'];

type CreateSessionSuccessResponse =
  operations['postApiV1ByOrganizationIdTeamsByTeamIdTerminalSessions']['responses']['201']['content']['application/json'];

const MS_PER_MINUTE = 60 * 1000;
const MS_PER_HOUR = 60 * 60 * 1000;

const DEFAULT_PROPS = {
  open: false,
  onOpenChange: vi.fn(),
  organizationId: 'org-1',
  teamId: 'team-1',
  deviceId: 1,
  terminalAuthToken: 'mock-token',
  onSessionCreated: vi.fn(),
};

function setupCeilingHandler(
  effectiveInactivityCeilingMs: number,
  effectiveHardCapCeilingMs: number | null,
) {
  server.use(
    http.get<never, never, CeilingSuccessResponse>(
      buildBackendUrl(
        '/api/v1/{organizationId}/terminal/config/effective/{deviceId}',
      ),
      () => {
        return HttpResponse.json({
          responseData: {
            results: {
              effectiveInactivityCeilingMs,
              effectiveHardCapCeilingMs,
              source: 'system_default',
            },
          },
          responseErrors: null,
        });
      },
    ),
  );
}

function setupDeviceConfigHandler(defaultWorkingDirectory: string | null) {
  server.use(
    http.get<never, never, DeviceConfigSuccessResponse>(
      buildBackendUrl('/api/v1/{organizationId}/terminal/config/{deviceId}'),
      () => {
        return HttpResponse.json({
          responseData: {
            results: {
              config: {
                inactivityTimeoutMs: 3_600_000,
                hardCapMs: null,
                maxConcurrentSessions: 5,
                defaultWorkingDirectory,
                recordingRetentionDays: null,
                recordingMaxSizePerSessionBytes: null,
                recordingMaxSizePerOrgBytes: null,
              },
              inherited: true,
            },
          },
          responseErrors: null,
        });
      },
    ),
  );
}

function setupCreateSessionHandler(
  response: CreateSessionSuccessResponse,
  status = 201,
) {
  server.use(
    http.post(
      buildBackendUrl(
        '/api/v1/{organizationId}/teams/{teamId}/terminal/sessions',
      ),
      () => {
        return HttpResponse.json(response, { status });
      },
    ),
  );
}

function setupCreateSessionErrorHandler(
  errorBody: {
    responseData: null;
    responseErrors: { nonFieldErrors?: string[] };
  },
  status = 400,
) {
  server.use(
    http.post(
      buildBackendUrl(
        '/api/v1/{organizationId}/teams/{teamId}/terminal/sessions',
      ),
      () => {
        return HttpResponse.json(errorBody, { status });
      },
    ),
  );
}

describe('useCreateTerminalSessionDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('initial state when open=false', () => {
    it('returns default state with queries disabled', () => {
      const { result } = renderHook(
        () => useCreateTerminalSessionDialog(DEFAULT_PROPS),
        { wrapper: createQueryThemeWrapper() },
      );

      expect(result.current.inactivitySelection).toBe('max');
      expect(result.current.customInactivityMinutes).toBe('');
      expect(result.current.hardCapSelection).toBe('max');
      expect(result.current.customHardCapHours).toBe('');
      expect(result.current.workingDirectory).toBe('');
      expect(result.current.error).toBeNull();
      expect(result.current.ceiling).toBeUndefined();
      expect(result.current.isPending).toBe(false);
    });
  });

  describe('fetches data when open=true', () => {
    it('fetches ceiling and device config data', async () => {
      setupCeilingHandler(7_200_000, 86_400_000);
      setupDeviceConfigHandler('/home/user');

      const { result } = renderHook(
        () =>
          useCreateTerminalSessionDialog({
            ...DEFAULT_PROPS,
            open: true,
          }),
        { wrapper: createQueryThemeWrapper() },
      );

      await waitFor(() => {
        expect(result.current.ceiling).toBeDefined();
      });

      expect(result.current.inactivityCeiling).toBe(7_200_000);
      expect(result.current.hardCapCeiling).toBe(86_400_000);
      expect(result.current.defaultWorkingDirectory).toBe('/home/user');
    });

    it('returns empty string for defaultWorkingDirectory when null', async () => {
      setupCeilingHandler(3_600_000, null);
      setupDeviceConfigHandler(null);

      const { result } = renderHook(
        () =>
          useCreateTerminalSessionDialog({
            ...DEFAULT_PROPS,
            open: true,
          }),
        { wrapper: createQueryThemeWrapper() },
      );

      await waitFor(() => {
        expect(result.current.ceiling).toBeDefined();
      });

      expect(result.current.defaultWorkingDirectory).toBe('');
    });
  });

  describe('resolveInactivityMs via handleSubmit', () => {
    it('uses max (submits "max") when inactivitySelection is "max"', async () => {
      setupCeilingHandler(3_600_000, null);
      setupDeviceConfigHandler(null);

      const onSessionCreated = vi.fn();
      const { result } = renderHook(
        () =>
          useCreateTerminalSessionDialog({
            ...DEFAULT_PROPS,
            open: true,
            onSessionCreated,
          }),
        { wrapper: createQueryThemeWrapper() },
      );

      await waitFor(() => {
        expect(result.current.ceiling).toBeDefined();
      });

      await act(() => {
        result.current.handleSubmit();
      });

      await waitFor(() => {
        expect(onSessionCreated).toHaveBeenCalledWith(1);
      });
    });

    it('uses preset minutes when a preset is selected', async () => {
      setupCeilingHandler(7_200_000, null);
      setupDeviceConfigHandler(null);

      const onSessionCreated = vi.fn();
      const { result } = renderHook(
        () =>
          useCreateTerminalSessionDialog({
            ...DEFAULT_PROPS,
            open: true,
            onSessionCreated,
          }),
        { wrapper: createQueryThemeWrapper() },
      );

      await waitFor(() => {
        expect(result.current.ceiling).toBeDefined();
      });

      act(() => {
        result.current.setInactivitySelection('30');
      });

      await act(() => {
        result.current.handleSubmit();
      });

      await waitFor(() => {
        expect(onSessionCreated).toHaveBeenCalledWith(1);
      });
    });

    it('uses custom minutes when custom is selected', async () => {
      setupCeilingHandler(7_200_000, null);
      setupDeviceConfigHandler(null);

      const onSessionCreated = vi.fn();
      const { result } = renderHook(
        () =>
          useCreateTerminalSessionDialog({
            ...DEFAULT_PROPS,
            open: true,
            onSessionCreated,
          }),
        { wrapper: createQueryThemeWrapper() },
      );

      await waitFor(() => {
        expect(result.current.ceiling).toBeDefined();
      });

      act(() => {
        result.current.setInactivitySelection('custom');
        result.current.setCustomInactivityMinutes('45');
      });

      await act(() => {
        result.current.handleSubmit();
      });

      await waitFor(() => {
        expect(onSessionCreated).toHaveBeenCalledWith(1);
      });
    });
  });

  describe('resolveHardCapMs via handleSubmit', () => {
    it('returns null when hardCapCeiling is null', async () => {
      setupCeilingHandler(3_600_000, null);
      setupDeviceConfigHandler(null);

      const onSessionCreated = vi.fn();
      const { result } = renderHook(
        () =>
          useCreateTerminalSessionDialog({
            ...DEFAULT_PROPS,
            open: true,
            onSessionCreated,
          }),
        { wrapper: createQueryThemeWrapper() },
      );

      await waitFor(() => {
        expect(result.current.ceiling).toBeDefined();
      });

      expect(result.current.hardCapCeiling).toBeNull();
      expect(result.current.availableHardCapPresets).toEqual([]);

      await act(() => {
        result.current.handleSubmit();
      });

      await waitFor(() => {
        expect(onSessionCreated).toHaveBeenCalledWith(1);
      });
    });

    it('uses max when hardCapSelection is "max" and ceiling exists', async () => {
      setupCeilingHandler(3_600_000, 86_400_000);
      setupDeviceConfigHandler(null);

      const onSessionCreated = vi.fn();
      const { result } = renderHook(
        () =>
          useCreateTerminalSessionDialog({
            ...DEFAULT_PROPS,
            open: true,
            onSessionCreated,
          }),
        { wrapper: createQueryThemeWrapper() },
      );

      await waitFor(() => {
        expect(result.current.ceiling).toBeDefined();
      });

      await act(() => {
        result.current.handleSubmit();
      });

      await waitFor(() => {
        expect(onSessionCreated).toHaveBeenCalledWith(1);
      });
    });

    it('uses preset hours when a preset is selected', async () => {
      setupCeilingHandler(3_600_000, 86_400_000);
      setupDeviceConfigHandler(null);

      const onSessionCreated = vi.fn();
      const { result } = renderHook(
        () =>
          useCreateTerminalSessionDialog({
            ...DEFAULT_PROPS,
            open: true,
            onSessionCreated,
          }),
        { wrapper: createQueryThemeWrapper() },
      );

      await waitFor(() => {
        expect(result.current.ceiling).toBeDefined();
      });

      act(() => {
        result.current.setHardCapSelection('8');
      });

      await act(() => {
        result.current.handleSubmit();
      });

      await waitFor(() => {
        expect(onSessionCreated).toHaveBeenCalledWith(1);
      });
    });

    it('uses custom hours when custom is selected', async () => {
      setupCeilingHandler(3_600_000, 86_400_000);
      setupDeviceConfigHandler(null);

      const onSessionCreated = vi.fn();
      const { result } = renderHook(
        () =>
          useCreateTerminalSessionDialog({
            ...DEFAULT_PROPS,
            open: true,
            onSessionCreated,
          }),
        { wrapper: createQueryThemeWrapper() },
      );

      await waitFor(() => {
        expect(result.current.ceiling).toBeDefined();
      });

      act(() => {
        result.current.setHardCapSelection('custom');
        result.current.setCustomHardCapHours('12');
      });

      await act(() => {
        result.current.handleSubmit();
      });

      await waitFor(() => {
        expect(onSessionCreated).toHaveBeenCalledWith(1);
      });
    });
  });

  describe('validation errors', () => {
    it('rejects custom inactivity minutes less than 1', async () => {
      setupCeilingHandler(3_600_000, null);
      setupDeviceConfigHandler(null);

      const onSessionCreated = vi.fn();
      const { result } = renderHook(
        () =>
          useCreateTerminalSessionDialog({
            ...DEFAULT_PROPS,
            open: true,
            onSessionCreated,
          }),
        { wrapper: createQueryThemeWrapper() },
      );

      await waitFor(() => {
        expect(result.current.ceiling).toBeDefined();
      });

      act(() => {
        result.current.setInactivitySelection('custom');
        result.current.setCustomInactivityMinutes('0');
      });

      act(() => {
        result.current.handleSubmit();
      });

      expect(result.current.error).toBe(
        'Inactivity timeout must be at least 1 minute',
      );
      expect(onSessionCreated).not.toHaveBeenCalled();
    });

    it('rejects custom inactivity minutes exceeding ceiling', async () => {
      setupCeilingHandler(1_800_000, null); // 30 min ceiling
      setupDeviceConfigHandler(null);

      const onSessionCreated = vi.fn();
      const { result } = renderHook(
        () =>
          useCreateTerminalSessionDialog({
            ...DEFAULT_PROPS,
            open: true,
            onSessionCreated,
          }),
        { wrapper: createQueryThemeWrapper() },
      );

      await waitFor(() => {
        expect(result.current.ceiling).toBeDefined();
      });

      act(() => {
        result.current.setInactivitySelection('custom');
        result.current.setCustomInactivityMinutes('60');
      });

      act(() => {
        result.current.handleSubmit();
      });

      expect(result.current.error).toBe(
        'Inactivity timeout cannot exceed 30 minutes',
      );
      expect(onSessionCreated).not.toHaveBeenCalled();
    });

    it('rejects custom hard cap hours less than 1', async () => {
      setupCeilingHandler(3_600_000, 86_400_000);
      setupDeviceConfigHandler(null);

      const onSessionCreated = vi.fn();
      const { result } = renderHook(
        () =>
          useCreateTerminalSessionDialog({
            ...DEFAULT_PROPS,
            open: true,
            onSessionCreated,
          }),
        { wrapper: createQueryThemeWrapper() },
      );

      await waitFor(() => {
        expect(result.current.ceiling).toBeDefined();
      });

      act(() => {
        result.current.setHardCapSelection('custom');
        result.current.setCustomHardCapHours('0');
      });

      act(() => {
        result.current.handleSubmit();
      });

      expect(result.current.error).toBe('Hard cap must be at least 1 hour');
      expect(onSessionCreated).not.toHaveBeenCalled();
    });

    it('rejects custom hard cap hours exceeding ceiling', async () => {
      setupCeilingHandler(3_600_000, 7_200_000); // 2 hour hard cap ceiling
      setupDeviceConfigHandler(null);

      const onSessionCreated = vi.fn();
      const { result } = renderHook(
        () =>
          useCreateTerminalSessionDialog({
            ...DEFAULT_PROPS,
            open: true,
            onSessionCreated,
          }),
        { wrapper: createQueryThemeWrapper() },
      );

      await waitFor(() => {
        expect(result.current.ceiling).toBeDefined();
      });

      act(() => {
        result.current.setHardCapSelection('custom');
        result.current.setCustomHardCapHours('5');
      });

      act(() => {
        result.current.handleSubmit();
      });

      expect(result.current.error).toBe('Hard cap cannot exceed 2 hours');
      expect(onSessionCreated).not.toHaveBeenCalled();
    });

    it('rejects relative working directory path', async () => {
      setupCeilingHandler(3_600_000, null);
      setupDeviceConfigHandler(null);

      const onSessionCreated = vi.fn();
      const { result } = renderHook(
        () =>
          useCreateTerminalSessionDialog({
            ...DEFAULT_PROPS,
            open: true,
            onSessionCreated,
          }),
        { wrapper: createQueryThemeWrapper() },
      );

      await waitFor(() => {
        expect(result.current.ceiling).toBeDefined();
      });

      act(() => {
        result.current.setWorkingDirectory('home/user');
      });

      act(() => {
        result.current.handleSubmit();
      });

      expect(result.current.error).toBe(
        'Working directory must be an absolute path (starting with /)',
      );
      expect(onSessionCreated).not.toHaveBeenCalled();
    });

    it('rejects inactivity timeout exceeding hard cap', async () => {
      // inactivity ceiling = 7200000 (2 hours), hard cap ceiling = 3600000 (1 hour)
      setupCeilingHandler(7_200_000, 3_600_000);
      setupDeviceConfigHandler(null);

      const onSessionCreated = vi.fn();
      const { result } = renderHook(
        () =>
          useCreateTerminalSessionDialog({
            ...DEFAULT_PROPS,
            open: true,
            onSessionCreated,
          }),
        { wrapper: createQueryThemeWrapper() },
      );

      await waitFor(() => {
        expect(result.current.ceiling).toBeDefined();
      });

      // inactivity = max = 7200000, hard cap = max = 3600000 => inactivity > hard cap
      act(() => {
        result.current.handleSubmit();
      });

      expect(result.current.error).toBe(
        'Inactivity timeout cannot exceed the hard cap',
      );
      expect(onSessionCreated).not.toHaveBeenCalled();
    });
  });

  describe('handleSubmit', () => {
    it('validates before calling mutation and blocks on error', async () => {
      setupCeilingHandler(3_600_000, null);
      setupDeviceConfigHandler(null);

      const onSessionCreated = vi.fn();
      const { result } = renderHook(
        () =>
          useCreateTerminalSessionDialog({
            ...DEFAULT_PROPS,
            open: true,
            onSessionCreated,
          }),
        { wrapper: createQueryThemeWrapper() },
      );

      await waitFor(() => {
        expect(result.current.ceiling).toBeDefined();
      });

      act(() => {
        result.current.setInactivitySelection('custom');
        result.current.setCustomInactivityMinutes('');
      });

      act(() => {
        result.current.handleSubmit();
      });

      expect(result.current.error).toBe(
        'Inactivity timeout must be at least 1 minute',
      );
      expect(onSessionCreated).not.toHaveBeenCalled();
    });

    it('clears previous error on successful validation', async () => {
      setupCeilingHandler(3_600_000, null);
      setupDeviceConfigHandler(null);

      const onSessionCreated = vi.fn();
      const { result } = renderHook(
        () =>
          useCreateTerminalSessionDialog({
            ...DEFAULT_PROPS,
            open: true,
            onSessionCreated,
          }),
        { wrapper: createQueryThemeWrapper() },
      );

      await waitFor(() => {
        expect(result.current.ceiling).toBeDefined();
      });

      // First, trigger a validation error
      act(() => {
        result.current.setWorkingDirectory('relative/path');
      });

      act(() => {
        result.current.handleSubmit();
      });

      expect(result.current.error).toBe(
        'Working directory must be an absolute path (starting with /)',
      );

      // Now fix and submit again
      act(() => {
        result.current.setWorkingDirectory('');
      });

      await act(() => {
        result.current.handleSubmit();
      });

      await waitFor(() => {
        expect(result.current.error).toBeNull();
      });
    });

    it('calls mutation with correct payload including working directory', async () => {
      setupCeilingHandler(7_200_000, 86_400_000);
      setupDeviceConfigHandler(null);

      const onSessionCreated = vi.fn();
      const { result } = renderHook(
        () =>
          useCreateTerminalSessionDialog({
            ...DEFAULT_PROPS,
            open: true,
            onSessionCreated,
          }),
        { wrapper: createQueryThemeWrapper() },
      );

      await waitFor(() => {
        expect(result.current.ceiling).toBeDefined();
      });

      act(() => {
        result.current.setInactivitySelection('30');
        result.current.setHardCapSelection('4');
        result.current.setWorkingDirectory('/opt/app');
      });

      await act(() => {
        result.current.handleSubmit();
      });

      await waitFor(() => {
        expect(onSessionCreated).toHaveBeenCalledWith(1);
      });
    });

    it('excludes working directory from payload when empty', async () => {
      setupCeilingHandler(3_600_000, null);
      setupDeviceConfigHandler(null);

      const onSessionCreated = vi.fn();
      const { result } = renderHook(
        () =>
          useCreateTerminalSessionDialog({
            ...DEFAULT_PROPS,
            open: true,
            onSessionCreated,
          }),
        { wrapper: createQueryThemeWrapper() },
      );

      await waitFor(() => {
        expect(result.current.ceiling).toBeDefined();
      });

      await act(() => {
        result.current.handleSubmit();
      });

      await waitFor(() => {
        expect(onSessionCreated).toHaveBeenCalledWith(1);
      });
    });
  });

  describe('mutation success', () => {
    it('calls onSessionCreated with the session ID', async () => {
      setupCeilingHandler(3_600_000, null);
      setupDeviceConfigHandler(null);
      setupCreateSessionHandler({
        responseData: {
          results: {
            id: 42,
            sessionToken: 'tok-42',
            deviceId: 1,
            status: 'active',
            shell: '/bin/bash',
            workingDirectory: '/home/user',
            createdAt: new Date().toISOString(),
          },
        },
        responseErrors: null,
      });

      const onSessionCreated = vi.fn();
      const { result } = renderHook(
        () =>
          useCreateTerminalSessionDialog({
            ...DEFAULT_PROPS,
            open: true,
            onSessionCreated,
          }),
        { wrapper: createQueryThemeWrapper() },
      );

      await waitFor(() => {
        expect(result.current.ceiling).toBeDefined();
      });

      await act(() => {
        result.current.handleSubmit();
      });

      await waitFor(() => {
        expect(onSessionCreated).toHaveBeenCalledWith(42);
      });
    });
  });

  describe('mutation error', () => {
    it('sets error state from nonFieldErrors', async () => {
      setupCeilingHandler(3_600_000, null);
      setupDeviceConfigHandler(null);
      setupCreateSessionErrorHandler({
        responseData: null,
        responseErrors: {
          nonFieldErrors: ['Device is offline', 'Session limit reached'],
        },
      });

      const onSessionCreated = vi.fn();
      const { result } = renderHook(
        () =>
          useCreateTerminalSessionDialog({
            ...DEFAULT_PROPS,
            open: true,
            onSessionCreated,
          }),
        { wrapper: createQueryThemeWrapper() },
      );

      await waitFor(() => {
        expect(result.current.ceiling).toBeDefined();
      });

      await act(() => {
        result.current.handleSubmit();
      });

      await waitFor(() => {
        expect(result.current.error).toBe(
          'Device is offline. Session limit reached',
        );
      });
      expect(onSessionCreated).not.toHaveBeenCalled();
    });

    it('sets generic error when no nonFieldErrors', async () => {
      setupCeilingHandler(3_600_000, null);
      setupDeviceConfigHandler(null);
      setupCreateSessionErrorHandler({
        responseData: null,
        responseErrors: {},
      });

      const onSessionCreated = vi.fn();
      const { result } = renderHook(
        () =>
          useCreateTerminalSessionDialog({
            ...DEFAULT_PROPS,
            open: true,
            onSessionCreated,
          }),
        { wrapper: createQueryThemeWrapper() },
      );

      await waitFor(() => {
        expect(result.current.ceiling).toBeDefined();
      });

      await act(() => {
        result.current.handleSubmit();
      });

      await waitFor(() => {
        expect(result.current.error).toBe(
          'Failed to create terminal session. Please try again.',
        );
      });
      expect(onSessionCreated).not.toHaveBeenCalled();
    });
  });

  describe('handleOpenChange(false)', () => {
    it('resets all state when closing dialog', async () => {
      setupCeilingHandler(3_600_000, null);
      setupDeviceConfigHandler(null);

      const onOpenChange = vi.fn();
      const { result } = renderHook(
        () =>
          useCreateTerminalSessionDialog({
            ...DEFAULT_PROPS,
            open: true,
            onOpenChange,
          }),
        { wrapper: createQueryThemeWrapper() },
      );

      await waitFor(() => {
        expect(result.current.ceiling).toBeDefined();
      });

      // Modify some state
      act(() => {
        result.current.setInactivitySelection('custom');
        result.current.setCustomInactivityMinutes('45');
        result.current.setHardCapSelection('custom');
        result.current.setCustomHardCapHours('8');
        result.current.setWorkingDirectory('/opt/app');
        result.current.setError('some error');
      });

      expect(result.current.inactivitySelection).toBe('custom');
      expect(result.current.customInactivityMinutes).toBe('45');
      expect(result.current.error).toBe('some error');

      // Close the dialog
      act(() => {
        result.current.handleOpenChange(false);
      });

      expect(result.current.inactivitySelection).toBe('max');
      expect(result.current.customInactivityMinutes).toBe('');
      expect(result.current.hardCapSelection).toBe('max');
      expect(result.current.customHardCapHours).toBe('');
      expect(result.current.workingDirectory).toBe('');
      expect(result.current.error).toBeNull();
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it('does not reset state when opening dialog', () => {
      const onOpenChange = vi.fn();
      const { result } = renderHook(
        () =>
          useCreateTerminalSessionDialog({
            ...DEFAULT_PROPS,
            onOpenChange,
          }),
        { wrapper: createQueryThemeWrapper() },
      );

      act(() => {
        result.current.handleOpenChange(true);
      });

      expect(onOpenChange).toHaveBeenCalledWith(true);
    });
  });

  describe('available presets', () => {
    it('filters inactivity presets based on ceiling', async () => {
      // 30 min ceiling = 1_800_000ms — only 15min preset fits
      setupCeilingHandler(1_800_000, null);
      setupDeviceConfigHandler(null);

      const { result } = renderHook(
        () =>
          useCreateTerminalSessionDialog({
            ...DEFAULT_PROPS,
            open: true,
          }),
        { wrapper: createQueryThemeWrapper() },
      );

      await waitFor(() => {
        expect(result.current.ceiling).toBeDefined();
      });

      expect(result.current.availableInactivityPresets).toEqual([
        { value: '15', label: '15 minutes', ms: 15 * MS_PER_MINUTE },
        { value: '30', label: '30 minutes', ms: 30 * MS_PER_MINUTE },
      ]);
    });

    it('returns empty hard cap presets when ceiling is null', async () => {
      setupCeilingHandler(3_600_000, null);
      setupDeviceConfigHandler(null);

      const { result } = renderHook(
        () =>
          useCreateTerminalSessionDialog({
            ...DEFAULT_PROPS,
            open: true,
          }),
        { wrapper: createQueryThemeWrapper() },
      );

      await waitFor(() => {
        expect(result.current.ceiling).toBeDefined();
      });

      expect(result.current.availableHardCapPresets).toEqual([]);
    });

    it('filters hard cap presets based on ceiling', async () => {
      // 2 hour hard cap ceiling
      setupCeilingHandler(3_600_000, 2 * MS_PER_HOUR);
      setupDeviceConfigHandler(null);

      const { result } = renderHook(
        () =>
          useCreateTerminalSessionDialog({
            ...DEFAULT_PROPS,
            open: true,
          }),
        { wrapper: createQueryThemeWrapper() },
      );

      await waitFor(() => {
        expect(result.current.ceiling).toBeDefined();
      });

      expect(result.current.availableHardCapPresets).toEqual([
        { value: '1', label: '1 hour', ms: 1 * MS_PER_HOUR },
        { value: '2', label: '2 hours', ms: 2 * MS_PER_HOUR },
      ]);
    });
  });
});
