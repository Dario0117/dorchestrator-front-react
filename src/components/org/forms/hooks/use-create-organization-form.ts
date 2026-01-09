import { useAppForm } from '@components/org/forms/hooks/app-form';
import { createOrganizationFormSchema } from '@components/org/forms/validation/create-organization-form.schema';
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
      onChange: createOrganizationFormSchema,
      async onSubmitAsync({ value }) {
        try {
          const result = await createOrganizationMutation.mutateAsync({
            name: value.name,
            slug: value.slug,
          });

          if (result) {
            handleSuccess(result);
          }
        } catch (exception: unknown) {
          const error = exception as Error;
          logError({
            message: 'Organization creation failed',
            error,
          });

          // Check for slug uniqueness error
          if (
            error.message?.includes('slug') ||
            error.message?.includes('already taken')
          ) {
            return {
              form: [],
              fields: {
                slug: ['This slug is already taken'],
              },
            };
          }

          return {
            form: [
              error.message || 'Something went wrong, please try again later.',
            ],
            fields: {},
          };
        }
      },
    },
  });

  return form;
}
