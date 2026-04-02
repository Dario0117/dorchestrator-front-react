import { Alert, AlertDescription } from '@components/ds/atoms/alert';
import { Separator } from '@components/ds/atoms/separator';
import { SmallText } from '@components/ds/atoms/small-text';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@components/ds/molecules/dialog';
import { DeviceConfigForm } from '@domains/devices/forms/device-config.form';
import { DeviceConfigDialogSkeleton } from '@domains/devices/modals/device-config-dialog.skeleton';
import { DeviceSandboxConfig } from '@domains/sandbox/components/device-sandbox-config';
import { useDeviceSandboxConfigQueryOptions } from '@domains/sandbox/services/get-device-sandbox-config.http-service';
import { useGetDeviceConfigQueryOptions } from '@domains/terminal/services/get-device-config.http-service';
import { useGetTerminalConfigQueryOptions } from '@domains/terminal/services/get-terminal-config.http-service';
import { useUpdateDeviceConfigMutation } from '@domains/terminal/services/update-device-config.http-service';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const MS_PER_MINUTE = 60 * 1000;
const MS_PER_HOUR = 60 * 60 * 1000;

interface DeviceConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationId: string;
  deviceId: number;
  deviceName: string;
}

export function DeviceConfigDialog({
  open,
  onOpenChange,
  organizationId,
  deviceId,
  deviceName,
}: DeviceConfigDialogProps) {
  const { data, isLoading } = useQuery({
    ...useGetDeviceConfigQueryOptions(organizationId, deviceId),
    enabled: open,
  });
  const { data: orgConfigData } = useQuery({
    ...useGetTerminalConfigQueryOptions(organizationId),
    enabled: open,
  });
  const { data: sandboxConfigData } = useQuery({
    ...useDeviceSandboxConfigQueryOptions(organizationId, deviceId),
    enabled: open,
  });
  const updateConfigMutation = useUpdateDeviceConfigMutation();
  const [showSuccess, setShowSuccess] = useState(false);
  const successTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(successTimeoutRef.current), []);

  // L8: Reset success alert when dialog opens to prevent stale alerts bleeding across cycles
  useEffect(() => {
    if (open) {
      clearTimeout(successTimeoutRef.current);
      setShowSuccess(false);
    }
  }, [open]);

  const config = data?.responseData?.results?.config;
  const inherited = data?.responseData?.results?.inherited ?? true;
  const orgConfig = orgConfigData?.responseData?.results;

  const orgCeiling = buildOrgCeiling(orgConfig);
  const defaultValues = buildDefaultValues(config);

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Device Configuration: {deviceName}</DialogTitle>
          <DialogDescription>
            Configure terminal session timeouts and defaults for this device.
            {inherited && config && (
              <SmallText
                color="muted"
                block
                spaceAbove="xs"
              >
                Currently using inherited settings. Saving will create a
                device-specific configuration.
              </SmallText>
            )}
          </DialogDescription>
        </DialogHeader>

        {showSuccess && (
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>
              Device configuration updated successfully.
            </AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <DeviceConfigDialogSkeleton />
        ) : (
          <>
            <DeviceConfigForm
              key={`${config?.inactivityTimeoutMs}-${config?.hardCapMs}-${config?.defaultWorkingDirectory}`}
              updateConfigMutation={updateConfigMutation}
              organizationId={organizationId}
              deviceId={deviceId}
              defaultValues={defaultValues}
              orgCeiling={orgCeiling}
              handleSuccess={() => {
                clearTimeout(successTimeoutRef.current);
                setShowSuccess(true);
                successTimeoutRef.current = setTimeout(
                  () => setShowSuccess(false),
                  5000,
                );
              }}
            />
            <Separator />
            <DeviceSandboxConfig
              organizationId={organizationId}
              deviceId={deviceId}
              effectivePresetId={
                sandboxConfigData?.responseData?.results?.presetId
              }
              effectivePresetName={
                sandboxConfigData?.responseData?.results?.presetName
              }
            />
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function msToMinutes(ms: number) {
  return Math.round(ms / MS_PER_MINUTE);
}

function msToHours(ms: number | null | undefined) {
  return ms != null ? Math.round(ms / MS_PER_HOUR) : null;
}

function buildOrgCeiling(
  orgConfig:
    | { inactivityTimeoutMs: number; hardCapMs?: number | null }
    | undefined,
) {
  if (!orgConfig) {
    return null;
  }
  return {
    inactivityTimeoutMinutes: msToMinutes(orgConfig.inactivityTimeoutMs),
    hardCapHours: msToHours(orgConfig.hardCapMs),
  };
}

function buildDefaultValues(
  config:
    | {
        inactivityTimeoutMs: number;
        hardCapMs?: number | null;
        defaultWorkingDirectory?: string | null;
      }
    | undefined,
) {
  if (!config) {
    return {
      inactivityTimeoutMinutes: 60,
      hardCapHours: '' as const,
      defaultWorkingDirectory: '',
    };
  }
  return {
    inactivityTimeoutMinutes: msToMinutes(config.inactivityTimeoutMs),
    hardCapHours: msToHours(config.hardCapMs) ?? ('' as const),
    defaultWorkingDirectory: config.defaultWorkingDirectory ?? '',
  };
}
