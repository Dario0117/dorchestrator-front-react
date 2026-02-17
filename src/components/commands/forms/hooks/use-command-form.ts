import type { CommandFormData } from '@components/commands/forms/validation/command-form.schema';
import { commandFormSchema } from '@components/commands/forms/validation/command-form.schema';
import { useAppForm } from '@components/org/forms/hooks/app-form';
import { setFormErrorsFromResponse } from '@lib/api-error.utils';
import { logError } from '@lib/logger.utils';
import type { useSubmitCommandMutationType } from '@services/commands/submit-command.http-service';

interface UseCommandFormProps {
  submitCommandMutation: useSubmitCommandMutationType;
  handleSuccess: (
    data: NonNullable<useSubmitCommandMutationType['data']>,
  ) => void;
  organizationId: string;
}

export function useCommandForm({
  submitCommandMutation,
  handleSuccess,
  organizationId,
}: UseCommandFormProps) {
  const form = useAppForm({
    defaultValues: {
      deviceId: 0,
      command: '',
    },
    validators: {
      onBlur: commandFormSchema,
    },
    onSubmit({ value }) {
      submitCommandMutation.mutate(
        {
          body: value,
          params: {
            path: { organizationId },
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
