import { useDeviceSandboxConfigQueryOptions } from '@domains/sandbox/services/get-device-sandbox-config.http-service';
import { useListSandboxPresetsQueryOptions } from '@domains/sandbox/services/list-sandbox-presets.http-service';
import { useRequestSandboxOverrideMutation } from '@domains/sandbox/services/request-sandbox-override.http-service';
import type { ApprovalRequestType } from '@domains/sandbox/services/sandbox.http-service.constants';
import {
  filterPresets,
  HARD_CAP_PRESETS,
  type HardCapSelection,
  INACTIVITY_PRESETS,
  type InactivitySelection,
  MS_PER_HOUR,
  MS_PER_MINUTE,
} from '@domains/terminal/modals/create-terminal-session-dialog.constants';
import { useCreateTerminalSessionMutation } from '@domains/terminal/services/create-terminal-session.http-service';
import { useGetDeviceConfigQueryOptions } from '@domains/terminal/services/get-device-config.http-service';
import { useGetEffectiveCeilingQueryOptions } from '@domains/terminal/services/get-effective-ceiling.http-service';
import { formatDurationHuman } from '@lib/format-duration';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

interface UseCreateTerminalSessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationId: string;
  teamId: string;
  deviceId: number;
  terminalAuthToken: string;
  onSessionCreated: (sessionId: number) => void;
}

export function useCreateTerminalSessionDialog({
  open,
  onOpenChange,
  organizationId,
  teamId,
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

  const { data: sandboxConfigData } = useQuery({
    ...useDeviceSandboxConfigQueryOptions(organizationId, deviceId),
    enabled: open,
  });

  const { data: presetsData } = useQuery({
    ...useListSandboxPresetsQueryOptions(organizationId),
    enabled: open,
  });

  const createSessionMutation = useCreateTerminalSessionMutation();
  const requestOverrideMutation = useRequestSandboxOverrideMutation();

  const presets = presetsData?.responseData?.results ?? [];

  const ceiling = data?.responseData?.results;
  const inactivityCeiling = ceiling?.effectiveInactivityCeilingMs ?? 0;
  const hardCapCeiling = ceiling?.effectiveHardCapCeilingMs;

  const deviceConfig = deviceConfigData?.responseData?.results?.config;
  const defaultWorkingDirectory = deviceConfig?.defaultWorkingDirectory ?? '';

  const effectiveSandboxConfig = sandboxConfigData?.responseData?.results;
  const effectivePresetId = effectiveSandboxConfig?.presetId ?? 0;

  const [inactivitySelection, setInactivitySelection] =
    useState<InactivitySelection>('max');
  const [customInactivityMinutes, setCustomInactivityMinutes] = useState('');
  const [hardCapSelection, setHardCapSelection] =
    useState<HardCapSelection>('max');
  const [customHardCapHours, setCustomHardCapHours] = useState('');
  const [shell, setShell] = useState('/bin/bash');
  const [workingDirectory, setWorkingDirectory] = useState('');
  const [selectedPresetId, setSelectedPresetId] = useState<number | null>(null);
  const [approvalPending, setApprovalPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activePresetId = selectedPresetId ?? effectivePresetId;
  const activePreset = presets.find((p) => p.id === activePresetId);
  const isSandboxOverride = activePreset?.requiresApproval === true;

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

    // If sandbox override requested, submit approval request instead
    if (isSandboxOverride) {
      requestOverrideMutation.mutate(
        {
          params: { path: { organizationId, teamId } },
          body: {
            deviceId,
            requestType: 'terminal' satisfies ApprovalRequestType,
            presetId: activePresetId,
          },
        },
        {
          onSuccess: () => {
            setApprovalPending(true);
          },
          onError: () => {
            setError('Failed to request sandbox override. Please try again.');
          },
        },
      );
      return;
    }

    const inactivityTimeoutMs = resolveInactivityMs();
    const hardCapMs = resolveHardCapMs();

    createSessionMutation.mutate(
      {
        params: { path: { organizationId, teamId } },
        body: {
          terminalAuthToken,
          deviceId,
          sandboxPresetId: activePresetId,
          shell,
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
      setShell('/bin/bash');
      setWorkingDirectory('');
      setSelectedPresetId(null);
      setApprovalPending(false);
      setError(null);
      createSessionMutation.reset();
      requestOverrideMutation.reset();
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
    shell,
    setShell,
    workingDirectory,
    setWorkingDirectory,
    activePresetId,
    setSelectedPresetId,
    effectivePresetId,
    isSandboxOverride,
    approvalPending,
    presets,
    error,
    setError,
    availableInactivityPresets,
    availableHardCapPresets,
    isPending:
      createSessionMutation.isPending || requestOverrideMutation.isPending,
    handleSubmit,
    handleOpenChange,
  };
}
