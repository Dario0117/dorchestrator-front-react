import type { UseDeviceConfigFormProps } from '@domains/devices/forms/hooks/use-device-config-form.types';
import { deviceConfigFormSchema } from '@domains/devices/forms/validation/device-config-form.schema';
import { useAppForm } from '@domains/org/forms/hooks/app-form';
import { setFormErrorsFromResponse } from '@lib/api-error.utils';
import { logError } from '@lib/logger.utils';

const MS_PER_MINUTE = 60 * 1000;
const MS_PER_HOUR = 60 * 60 * 1000;

export function useDeviceConfigForm({
  updateConfigMutation,
  organizationId,
  deviceId,
  defaultValues,
  handleSuccess,
}: UseDeviceConfigFormProps) {
  const form = useAppForm({
    defaultValues,
    validators: {
      onSubmit: deviceConfigFormSchema,
    },
    onSubmit({ value }) {
      const inactivityTimeoutMs =
        Number(value.inactivityTimeoutMinutes) * MS_PER_MINUTE;
      const hardCapMs =
        value.hardCapHours !== '' && value.hardCapHours !== null
          ? Number(value.hardCapHours) * MS_PER_HOUR
          : null;
      const defaultWorkingDirectory =
        value.defaultWorkingDirectory === '' ||
        value.defaultWorkingDirectory === null
          ? null
          : value.defaultWorkingDirectory;

      updateConfigMutation.mutate(
        {
          params: {
            path: { organizationId, deviceId },
          },
          body: {
            inactivityTimeoutMs,
            hardCapMs,
            defaultWorkingDirectory,
          },
        },
        {
          onSuccess() {
            handleSuccess();
          },
          onError(error) {
            logError({ error }, 'Device config update failed');
            setFormErrorsFromResponse(error, form);
          },
        },
      );
    },
  });

  return form;
}
