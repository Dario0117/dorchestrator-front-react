import { Button } from '@components/ds/atoms/button';
import { ResponsiveRow } from '@components/ds/atoms/responsive-row';
import { Stack } from '@components/ds/atoms/stack';
import type { SandboxState } from '@domains/commands/forms/command-form.types';
import {
  buildDeviceOptions,
  MAX_COMMAND_LENGTH,
} from '@domains/commands/forms/device-status.utils';
import type { CommandFormType } from '@domains/commands/forms/hooks/use-command-form';
import type { PinnedDevice } from '@domains/commands/modals/execute-command-modal';
import { useDevicesPresence } from '@domains/devices/hooks/use-devices-presence';
import type { ListDevicesDevice } from '@domains/devices/services/list-devices.http-service';
import { SandboxSelector } from '@domains/sandbox/components/sandbox-selector';
import { ConfirmDialog } from '@domains/shared/components/confirm-dialog';
import { useMemo, useRef, useState } from 'react';

interface CommandFormInnerProps {
  form: CommandFormType;
  devices: ListDevicesDevice[];
  pinnedDevice?: PinnedDevice;
  onCancel?: () => void;
  onDeviceChange?: (deviceId: number) => void;
  sandbox?: SandboxState;
}

export function CommandFormInner({
  form,
  devices,
  pinnedDevice,
  onCancel,
  onDeviceChange,
  sandbox,
}: CommandFormInnerProps) {
  const [showOfflineDialog, setShowOfflineDialog] = useState(false);

  const deviceIds = useMemo(() => devices.map((d) => d.id), [devices]);
  const { presenceMap } = useDevicesPresence(deviceIds);

  const deviceOptions = useMemo(() => {
    if (pinnedDevice) {
      return [{ value: String(pinnedDevice.id), label: pinnedDevice.name }];
    }
    return buildDeviceOptions(devices, presenceMap);
  }, [pinnedDevice, devices, presenceMap]);

  const handleFormSubmit = () => {
    if (pinnedDevice) {
      form.handleSubmit();
      return;
    }

    const deviceId = form.getFieldValue('deviceId');
    const isOnline = presenceMap.get(deviceId) ?? false;

    if (!isOnline) {
      setShowOfflineDialog(true);
      return;
    }

    form.handleSubmit();
  };

  const handleOfflineConfirm = () => {
    setShowOfflineDialog(false);
    form.handleSubmit();
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      window.history.back();
    }
  };

  const isDeviceDisabled = !!pinnedDevice;
  const prevDeviceIdRef = useRef<number>(0);

  return (
    <>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleFormSubmit();
        }}
      >
        <Stack gap="lg">
          {/* Device Selector */}
          <form.AppField name="deviceId">
            {(field) => (
              <field.AppFormSelect
                label="Device"
                placeholder="Select a device..."
                options={deviceOptions}
                disabled={isDeviceDisabled}
              />
            )}
          </form.AppField>

          {/* Notify parent when device changes */}
          {onDeviceChange && (
            <form.Subscribe selector={(state) => state.values.deviceId}>
              {(deviceId) => {
                if (deviceId > 0 && deviceId !== prevDeviceIdRef.current) {
                  prevDeviceIdRef.current = deviceId;
                  // Schedule to avoid calling during render
                  queueMicrotask(() => onDeviceChange(deviceId));
                }
                return null;
              }}
            </form.Subscribe>
          )}

          {/* Command Textarea */}
          <form.AppField name="command">
            {(field) => (
              <field.AppFormTextarea
                label="Command"
                placeholder="Enter your command..."
                rows={6}
                maxLength={MAX_COMMAND_LENGTH}
              />
            )}
          </form.AppField>

          {/* Shell Selector */}
          <form.AppField name="shell">
            {(field) => (
              <field.AppFormSelect
                label="Shell"
                placeholder="Select a shell..."
                options={[
                  { value: '/bin/bash', label: '/bin/bash' },
                  { value: '/bin/zsh', label: '/bin/zsh' },
                  { value: '/bin/sh', label: '/bin/sh' },
                ]}
              />
            )}
          </form.AppField>

          {/* Sandbox Selector */}
          {sandbox && (
            <SandboxSelector
              value={sandbox.activePresetId}
              onChange={sandbox.onPresetChange}
              effectivePresetId={sandbox.effectivePresetId}
              presets={sandbox.presets}
            />
          )}

          {/* Action Buttons */}
          <ResponsiveRow
            gap="md"
            justify="end"
          >
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={handleCancel}
            >
              {sandbox?.approvalPending ? 'Close' : 'Cancel'}
            </Button>
            {sandbox?.approvalPending ? (
              <Button
                type="button"
                size="lg"
                disabled
              >
                Pending Approval
              </Button>
            ) : (
              <form.AppForm>
                <form.AppSubscribeSubmitButton
                  label={
                    sandbox?.isSandboxOverride
                      ? 'Request Approval'
                      : 'Execute Command'
                  }
                  size="lg"
                  fullWidth={false}
                />
              </form.AppForm>
            )}
          </ResponsiveRow>

          <form.AppForm>
            <form.AppSubscribeErrorButton />
          </form.AppForm>
        </Stack>
      </form>

      <ConfirmDialog
        open={showOfflineDialog}
        onOpenChange={setShowOfflineDialog}
        title="Device Offline"
        desc="Device is currently offline. Command will execute when device reconnects. Continue?"
        handleConfirm={handleOfflineConfirm}
        confirmText="Continue"
      />
    </>
  );
}
