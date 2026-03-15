import { useAppForm } from '@components/org/forms/hooks/app-form';
import type { CreateTeamFormData } from '@components/org/forms/validation/create-team-form.schema';
import { createTeamFormSchema } from '@components/org/forms/validation/create-team-form.schema';
import { setFormErrorsFromResponse } from '@lib/api-error.utils';
import { logError } from '@lib/logger.utils';
import type { useCreateTeamMutationType } from '@services/teams/create-team.http-service';

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
      onBlur: createTeamFormSchema,
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

export type CreateTeamFormType = ReturnType<typeof useCreateTeamForm>;
export type CreateTeamFormFieldName = keyof CreateTeamFormData;
