import type { DeviceConfigFormProps } from '@domains/devices/forms/device-config.form.types';
import { useDeviceConfigForm } from '@domains/devices/forms/hooks/use-device-config-form';

export function DeviceConfigForm({
  updateConfigMutation,
  organizationId,
  deviceId,
  defaultValues,
  orgCeiling,
  handleSuccess,
}: DeviceConfigFormProps) {
  const form = useDeviceConfigForm({
    updateConfigMutation,
    organizationId,
    deviceId,
    defaultValues,
    handleSuccess,
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
    >
      <div className="flex flex-col gap-6">
        <form.AppField name="inactivityTimeoutMinutes">
          {(field) => (
            <field.AppFormField
              label="Inactivity Timeout (minutes)"
              type="number"
              placeholder="60"
              required
              helperText={
                orgCeiling
                  ? `Sessions will lock after this period of inactivity. Organization ceiling: ${orgCeiling.inactivityTimeoutMinutes} minutes.`
                  : 'Sessions will lock after this period of inactivity. Must not exceed the organization ceiling.'
              }
            />
          )}
        </form.AppField>

        <form.AppField name="hardCapHours">
          {(field) => (
            <field.AppFormField
              label="Hard Cap (hours)"
              type="number"
              placeholder="Leave empty for no hard cap"
              helperText={
                orgCeiling?.hardCapHours != null
                  ? `Maximum session lifetime regardless of activity. Organization hard cap: ${orgCeiling.hardCapHours} hours.`
                  : 'Maximum session lifetime regardless of activity. Must not exceed the organization ceiling.'
              }
            />
          )}
        </form.AppField>

        <form.AppField name="defaultWorkingDirectory">
          {(field) => (
            <field.AppFormField
              label="Default Working Directory"
              type="text"
              placeholder="/home/user"
              helperText="Default working directory for new terminal sessions on this device. Leave empty to use system default."
            />
          )}
        </form.AppField>

        <div className="flex flex-col gap-3">
          <form.AppForm>
            <form.AppSubscribeSubmitButton label="Save Device Configuration" />
          </form.AppForm>
        </div>
      </div>

      <form.AppForm>
        <form.AppSubscribeErrorButton />
      </form.AppForm>
    </form>
  );
}
