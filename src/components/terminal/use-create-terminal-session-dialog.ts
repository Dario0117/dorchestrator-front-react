import { formatDurationHuman } from '@lib/format-duration';
import { useCreateTerminalSessionMutation } from '@services/terminal/create-terminal-session.http-service';
import { useGetDeviceConfigQueryOptions } from '@services/terminal/get-device-config.http-service';
import { useGetEffectiveCeilingQueryOptions } from '@services/terminal/get-effective-ceiling.http-service';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import {
  filterPresets,
  HARD_CAP_PRESETS,
  type HardCapSelection,
  INACTIVITY_PRESETS,
  type InactivitySelection,
  MS_PER_HOUR,
  MS_PER_MINUTE,
} from './create-terminal-session-dialog.constants';

interface UseCreateTerminalSessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationId: string;
  deviceId: number;
  terminalAuthToken: string;
  onSessionCreated: (sessionId: number) => void;
}

export function useCreateTerminalSessionDialog({
  open,
  onOpenChange,
  organizationId,
  deviceId,
  terminalAuthToken,
  onSessionCreated,
}: UseCreateTerminalSessionDialogProps) {
  const { data, isLoading } = useQuery({
    ...useGetEffectiveCeilingQueryOptions(organizationId, deviceId),
    enabled: open,
  });

  const { data: deviceConfigData } = useQuery({
    ...useGetDeviceConfigQueryOptions(organizationId, deviceId),
    enabled: open,
  });

  const createSessionMutation = useCreateTerminalSessionMutation();

  const ceiling = data?.responseData?.results;
  const inactivityCeiling = ceiling?.effectiveInactivityCeilingMs ?? 0;
  const hardCapCeiling = ceiling?.effectiveHardCapCeilingMs;

  const deviceConfig = deviceConfigData?.responseData?.results?.config;
  const defaultWorkingDirectory = deviceConfig?.defaultWorkingDirectory ?? '';

  const [inactivitySelection, setInactivitySelection] =
    useState<InactivitySelection>('max');
  const [customInactivityMinutes, setCustomInactivityMinutes] = useState('');
  const [hardCapSelection, setHardCapSelection] =
    useState<HardCapSelection>('max');
  const [customHardCapHours, setCustomHardCapHours] = useState('');
  const [workingDirectory, setWorkingDirectory] = useState('');
  const [error, setError] = useState<string | null>(null);

  const availableInactivityPresets = filterPresets(
    INACTIVITY_PRESETS,
    inactivityCeiling,
  );
  const availableHardCapPresets = hardCapCeiling
    ? filterPresets(HARD_CAP_PRESETS, hardCapCeiling)
    : [];

  function resolveInactivityMs(): number | 'max' {
    if (inactivitySelection === 'max') {
      return 'max';
    }
    if (inactivitySelection === 'custom') {
      return Number(customInactivityMinutes) * MS_PER_MINUTE;
    }
    return Number(inactivitySelection) * MS_PER_MINUTE;
  }

  function resolveHardCapMs(): number | 'max' | null {
    if (hardCapCeiling == null) {
      return null;
    }
    if (hardCapSelection === 'max') {
      return 'max';
    }
    if (hardCapSelection === 'custom') {
      return Number(customHardCapHours) * MS_PER_HOUR;
    }
    return Number(hardCapSelection) * MS_PER_HOUR;
  }

  function validate(): string | null {
    if (inactivitySelection === 'custom') {
      const minutes = Number(customInactivityMinutes);
      if (!Number.isFinite(minutes) || minutes < 1) {
        return 'Inactivity timeout must be at least 1 minute';
      }
      if (minutes * MS_PER_MINUTE > inactivityCeiling) {
        return `Inactivity timeout cannot exceed ${formatDurationHuman(inactivityCeiling)}`;
      }
    }

    if (hardCapCeiling != null && hardCapSelection === 'custom') {
      const hours = Number(customHardCapHours);
      if (!Number.isFinite(hours) || hours < 1) {
        return 'Hard cap must be at least 1 hour';
      }
      if (hours * MS_PER_HOUR > hardCapCeiling) {
        return `Hard cap cannot exceed ${formatDurationHuman(hardCapCeiling)}`;
      }
    }

    if (
      workingDirectory.trim() !== '' &&
      !workingDirectory.trim().startsWith('/')
    ) {
      return 'Working directory must be an absolute path (starting with /)';
    }

    // Cross-field: inactivity timeout must not exceed hard cap
    const resolvedInactivity = resolveInactivityMs();
    const resolvedHardCap = resolveHardCapMs();
    const inactivityMs =
      resolvedInactivity === 'max' ? inactivityCeiling : resolvedInactivity;
    const hardCapMs =
      resolvedHardCap === 'max' ? hardCapCeiling : resolvedHardCap;
    if (hardCapMs != null && inactivityMs > hardCapMs) {
      return 'Inactivity timeout cannot exceed the hard cap';
    }

    return null;
  }

  const handleSubmit = () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);

    const inactivityTimeoutMs = resolveInactivityMs();
    const hardCapMs = resolveHardCapMs();

    createSessionMutation.mutate(
      {
        params: { path: { organizationId } },
        body: {
          terminalAuthToken,
          deviceId,
          inactivityTimeoutMs,
          hardCapMs,
          ...(workingDirectory.trim() !== '' && {
            workingDirectory: workingDirectory.trim(),
          }),
        },
      },
      {
        onSuccess: (responseData) => {
          const session = responseData.responseData.results;
          onSessionCreated(session.id);
        },
        onError: (mutationError) => {
          const nonFieldErrors = mutationError?.responseErrors?.nonFieldErrors;
          setError(
            nonFieldErrors?.length
              ? nonFieldErrors.join('. ')
              : 'Failed to create terminal session. Please try again.',
          );
        },
      },
    );
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setInactivitySelection('max');
      setCustomInactivityMinutes('');
      setHardCapSelection('max');
      setCustomHardCapHours('');
      setWorkingDirectory('');
      setError(null);
      createSessionMutation.reset();
    }
    onOpenChange(nextOpen);
  };

  return {
    isLoading,
    ceiling,
    inactivityCeiling,
    hardCapCeiling,
    defaultWorkingDirectory,
    inactivitySelection,
    setInactivitySelection,
    customInactivityMinutes,
    setCustomInactivityMinutes,
    hardCapSelection,
    setHardCapSelection,
    customHardCapHours,
    setCustomHardCapHours,
    workingDirectory,
    setWorkingDirectory,
    error,
    setError,
    availableInactivityPresets,
    availableHardCapPresets,
    isPending: createSessionMutation.isPending,
    handleSubmit,
    handleOpenChange,
  };
}
