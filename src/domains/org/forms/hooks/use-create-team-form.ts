import { useAppForm } from '@domains/org/forms/hooks/app-form';
import { createTeamFormSchema } from '@domains/org/forms/validation/create-team-form.schema';
import type { useCreateTeamMutationType } from '@domains/org/services/teams/create-team.http-service';
import { setFormErrorsFromResponse } from '@lib/api-error.utils';
import { logError } from '@lib/logger.utils';

interface UseCreateTeamFormProps {
  organizationId: string;
  createTeamMutation: useCreateTeamMutationType;
  handleSuccess: () => void;
}

export function useCreateTeamForm({
  organizationId,
  createTeamMutation,
  handleSuccess,
}: UseCreateTeamFormProps) {
  const form = useAppForm({
    defaultValues: {
      name: '',
      slug: '',
    },
    validators: {
      onSubmit: createTeamFormSchema,
    },
    onSubmit({ value }) {
      createTeamMutation.mutate(
        {
          params: { path: { organizationId } },
          body: value,
        },
        {
          onSuccess() {
            handleSuccess();
          },
          onError(error) {
            logError({ error }, 'Team creation failed');
            setFormErrorsFromResponse(error, form);
          },
        },
      );
    },
  });

  return form;
}
