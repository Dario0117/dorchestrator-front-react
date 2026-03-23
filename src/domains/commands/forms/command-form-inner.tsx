import { Button } from '@components/ds/atoms/button';
import { ResponsiveRow } from '@components/ds/atoms/responsive-row';
import { Stack } from '@components/ds/atoms/stack';
import {
  buildDeviceOptions,
  getDeviceStatus,
  MAX_COMMAND_LENGTH,
} from '@domains/commands/forms/device-status.utils';
import type { CommandFormType } from '@domains/commands/forms/hooks/use-command-form';
import type { PinnedDevice } from '@domains/commands/modals/execute-command-modal';
import type { ListDevicesDevice } from '@domains/devices/services/list-devices.http-service';
import { ConfirmDialog } from '@domains/shared/components/confirm-dialog';
import { useMemo, useState } from 'react';

interface CommandFormInnerProps {
  form: CommandFormType;
  devices: ListDevicesDevice[];
  pinnedDevice?: PinnedDevice;
  onCancel?: () => void;
}

export function CommandFormInner({
  form,
  devices,
  pinnedDevice,
  onCancel,
}: CommandFormInnerProps) {
  const [showOfflineDialog, setShowOfflineDialog] = useState(false);

  const deviceOptions = useMemo(() => {
    if (pinnedDevice) {
      return [{ value: String(pinnedDevice.id), label: pinnedDevice.name }];
    }
    return buildDeviceOptions(devices);
  }, [pinnedDevice, devices]);

  const handleFormSubmit = () => {
    if (pinnedDevice) {
      form.handleSubmit();
      return;
    }

    const deviceId = form.getFieldValue('deviceId');
    const selectedDevice = devices.find((d) => d.id === deviceId);

    if (selectedDevice && !getDeviceStatus(selectedDevice).isOnline) {
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
                required
                disabled={isDeviceDisabled}
              />
            )}
          </form.AppField>

          {/* Command Textarea */}
          <form.AppField name="command">
            {(field) => (
              <field.AppFormTextarea
                label="Command"
                placeholder="Enter your command..."
                rows={6}
                required
                maxLength={MAX_COMMAND_LENGTH}
              />
            )}
          </form.AppField>

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
              Cancel
            </Button>
            <form.AppForm>
              <form.AppSubscribeSubmitButton
                label="Execute Command"
                size="lg"
                fullWidth={false}
              />
            </form.AppForm>
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
