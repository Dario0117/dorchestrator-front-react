import type { PinnedDevice } from '@components/commands/execute-command-modal';
import {
  buildDeviceOptions,
  getDeviceStatus,
  MAX_COMMAND_LENGTH,
} from '@components/commands/forms/device-status.utils';
import type { CommandFormType } from '@components/commands/forms/hooks/use-command-form';
import { ConfirmDialog } from '@components/confirm-dialog';
import { Button } from '@components/ui/button';
import type { ListDevicesDevice } from '@services/devices/list-devices.http-service';
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
        <div className="space-y-4 md:space-y-6">
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
          <div className="flex flex-col-reverse gap-3 md:flex-row md:justify-end">
            <Button
              type="button"
              variant="outline"
              className="h-11"
              onClick={handleCancel}
            >
              Cancel
            </Button>
            <form.AppForm>
              <form.AppSubscribeSubmitButton
                label="Execute Command"
                className="h-11 w-auto"
              />
            </form.AppForm>
          </div>

          <form.AppForm>
            <form.AppSubscribeErrorButton />
          </form.AppForm>
        </div>
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
