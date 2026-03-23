import type { CommandFormData } from '@domains/commands/forms/validation/command-form.schema';
import { commandFormSchema } from '@domains/commands/forms/validation/command-form.schema';
import type { useSubmitCommandMutationType } from '@domains/commands/services/submit-command.http-service';
import { useAppForm } from '@domains/org/forms/hooks/app-form';
import { setFormErrorsFromResponse } from '@lib/api-error.utils';
import { logError } from '@lib/logger.utils';

interface UseCommandFormProps {
  submitCommandMutation: useSubmitCommandMutationType;
  handleSuccess: (
    data: NonNullable<useSubmitCommandMutationType['data']>,
  ) => void;
  organizationId: string;
  teamId: string;
  initialDeviceId?: number;
}

export function useCommandForm({
  submitCommandMutation,
  handleSuccess,
  organizationId,
  teamId,
  initialDeviceId,
}: UseCommandFormProps) {
  const form = useAppForm({
    defaultValues: {
      deviceId: initialDeviceId ?? 0,
      command: '',
    },
    validators: {
      onSubmit: commandFormSchema,
    },
    onSubmit({ value }) {
      submitCommandMutation.mutate(
        {
          body: value,
          params: {
            path: { organizationId, teamId },
          },
        },
        {
          onSuccess(data) {
            handleSuccess(data);
          },
          onError(error) {
            logError({ error }, 'Command submission failed');
            setFormErrorsFromResponse(error, form);
          },
        },
      );
    },
  });

  return form;
}

export type CommandFormType = ReturnType<typeof useCommandForm>;
export type CommandFormFieldName = keyof CommandFormData;
