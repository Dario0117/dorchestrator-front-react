import { useAppForm } from '@domains/org/forms/hooks/app-form';
import type { UseTerminalConfigFormProps } from '@domains/terminal/forms/hooks/use-terminal-config-form.types';
import { terminalConfigFormSchema } from '@domains/terminal/forms/validation/terminal-config-form.schema';
import { setFormErrorsFromResponse } from '@lib/api-error.utils';
import { logError } from '@lib/logger.utils';

const MS_PER_MINUTE = 60 * 1000;
const MS_PER_HOUR = 60 * 60 * 1000;

export function useTerminalConfigForm({
  updateConfigMutation,
  organizationId,
  defaultValues,
  handleSuccess,
}: UseTerminalConfigFormProps) {
  const form = useAppForm({
    defaultValues,
    validators: {
      onSubmit: terminalConfigFormSchema,
    },
    onSubmit({ value }) {
      const inactivityTimeoutMs =
        Number(value.inactivityTimeoutMinutes) * MS_PER_MINUTE;
      const hardCapMs =
        value.hardCapHours !== '' && value.hardCapHours !== null
          ? Number(value.hardCapHours) * MS_PER_HOUR
          : null;

      updateConfigMutation.mutate(
        {
          params: {
            path: { organizationId },
          },
          body: {
            inactivityTimeoutMs,
            hardCapMs,
          },
        },
        {
          onSuccess() {
            handleSuccess();
          },
          onError(error) {
            logError({ error }, 'Terminal config update failed');
            setFormErrorsFromResponse(error, form);
          },
        },
      );
    },
  });

  return form;
}
