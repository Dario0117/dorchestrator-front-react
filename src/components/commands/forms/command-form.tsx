import type { PinnedDevice } from '@components/commands/execute-command-modal';
import type { CommandFormType } from '@components/commands/forms/hooks/use-command-form';
import { ConfirmDialog } from '@components/confirm-dialog';
import { Button } from '@components/ui/button';
import { useCurrentOrganization } from '@hooks/use-current-organization';
import type { ListDevicesDevice } from '@services/devices/list-devices.http-service';
import { useDevicesSuspenseQuery } from '@services/devices/list-devices.http-service';
import { useEffect, useState } from 'react';

const MAX_COMMAND_LENGTH = 10000;
const OFFLINE_THRESHOLD_SECONDS = 30;

interface CommandFormProps {
  form: CommandFormType;
  pinnedDevice?: PinnedDevice;
  onCancel?: () => void;
}

function getDeviceStatus(device: ListDevicesDevice) {
  if (!device.lastSeenAt) {
    return { color: 'bg-red-500', text: 'Never connected', isOnline: false };
  }

  const lastSeen = new Date(device.lastSeenAt);
  const now = new Date();
  const diffSeconds = (now.getTime() - lastSeen.getTime()) / 1000;

  if (diffSeconds < OFFLINE_THRESHOLD_SECONDS) {
    return { color: 'bg-green-500', text: 'Online', isOnline: true };
  }

  return { color: 'bg-gray-500', text: 'Offline', isOnline: false };
}

/**
 * Fetches the device list and renders the full form.
 * Used when no pinnedDevice is provided (e.g. from the commands list page).
 */
function CommandFormWithDeviceQuery({
  form,
  onCancel,
}: Omit<CommandFormProps, 'pinnedDevice'>) {
  const currentOrganization = useCurrentOrganization();
  const { data } = useDevicesSuspenseQuery(currentOrganization.id, 1, 100);
  const devices = data.responseData?.results || [];

  return (
    <CommandFormInner
      form={form}
      devices={devices}
      onCancel={onCancel}
    />
  );
}

interface CommandFormInnerProps {
  form: CommandFormType;
  devices: ListDevicesDevice[];
  pinnedDevice?: PinnedDevice;
  onCancel?: () => void;
}

function CommandFormInner({
  form,
  devices,
  pinnedDevice,
  onCancel,
}: CommandFormInnerProps) {
  const [showOfflineDialog, setShowOfflineDialog] = useState(false);

  useEffect(() => {
    if (pinnedDevice) {
      form.setFieldValue('deviceId', pinnedDevice.id);
    }
  }, [pinnedDevice, form]);

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
                required
                disabled={isDeviceDisabled}
              >
                {pinnedDevice ? (
                  <option value={pinnedDevice.id}>{pinnedDevice.name}</option>
                ) : (
                  <>
                    <option value={0}>Select a device...</option>
                    {devices.map((device) => {
                      const status = getDeviceStatus(device);
                      return (
                        <option
                          key={device.id}
                          value={device.id}
                        >
                          {device.deviceName} ({status.text})
                        </option>
                      );
                    })}
                  </>
                )}
              </field.AppFormSelect>
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
            <form.Subscribe
              selector={(state) => state.isValid && !state.isPristine}
            >
              {(canSubmit) => (
                <Button
                  type="submit"
                  className="h-11"
                  disabled={!canSubmit}
                >
                  Execute Command
                </Button>
              )}
            </form.Subscribe>
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

export function CommandForm({
  form,
  pinnedDevice,
  onCancel,
}: CommandFormProps) {
  if (pinnedDevice) {
    return (
      <CommandFormInner
        form={form}
        devices={[]}
        pinnedDevice={pinnedDevice}
        onCancel={onCancel}
      />
    );
  }

  return (
    <CommandFormWithDeviceQuery
      form={form}
      onCancel={onCancel}
    />
  );
}
