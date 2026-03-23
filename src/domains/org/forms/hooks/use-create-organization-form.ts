import { useAppForm } from '@domains/org/forms/hooks/app-form';
import type { CreateOrganizationFormData } from '@domains/org/forms/validation/create-organization-form.schema';
import { createOrganizationFormSchema } from '@domains/org/forms/validation/create-organization-form.schema';
import type { useCreateOrganizationMutationType } from '@domains/org/services/organizations/create-organization.http-service';
import { setFormErrorsFromResponse } from '@lib/api-error.utils';
import { logError } from '@lib/logger.utils';

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
