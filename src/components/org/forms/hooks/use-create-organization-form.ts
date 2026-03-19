import { useAppForm } from '@components/org/forms/hooks/app-form';
import type { CreateOrganizationFormData } from '@components/org/forms/validation/create-organization-form.schema';
import { createOrganizationFormSchema } from '@components/org/forms/validation/create-organization-form.schema';
import { setFormErrorsFromResponse } from '@lib/api-error.utils';
import { logError } from '@lib/logger.utils';
import type { useCreateOrganizationMutationType } from '@services/organizations/create-organization.http-service';

interface UseCreateOrganizationFormProps {
  createOrganizationMutation: useCreateOrganizationMutationType;
  handleSuccess: (
    data: NonNullable<useCreateOrganizationMutationType['data']>,
  ) => void;
}

export function useCreateOrganizationForm({
  createOrganizationMutation,
  handleSuccess,
}: UseCreateOrganizationFormProps) {
  const form = useAppForm({
    defaultValues: {
      name: '',
      slug: '',
    },
    validators: {
      onSubmit: createOrganizationFormSchema,
    },
    onSubmit({ value }) {
      createOrganizationMutation.mutate(
        {
          body: value,
        },
        {
          onSuccess(data) {
            handleSuccess(data);
          },
          onError(error) {
            logError({ error }, 'Organization creation failed');
            setFormErrorsFromResponse(error, form);
          },
        },
      );
    },
  });

  return form;
}

export type CreateOrganizationFormType = ReturnType<
  typeof useCreateOrganizationForm
>;
export type CreateOrganizationFormFieldName = keyof CreateOrganizationFormData;
