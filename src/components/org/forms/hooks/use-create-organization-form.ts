import { useAppForm } from '@components/org/forms/hooks/app-form';
import type { CreateOrganizationFormData } from '@components/org/forms/validation/create-organization-form.schema';
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
      onBlur: createOrganizationFormSchema,
    },
    onSubmit({ value }) {
      createOrganizationMutation.mutate(value, {
        onSuccess(data) {
          // better-auth returns errors wrapped in success response
          if (
            data &&
            typeof data === 'object' &&
            'error' in data &&
            data.error
          ) {
            const appError = data.error as { message?: string };
            logError({
              message: 'Organization creation failed',
              error: appError,
            });

            const errorMessage = appError.message || '';

            // Check for slug uniqueness error
            if (
              errorMessage.includes('slug') ||
              errorMessage.includes('already taken')
            ) {
              form.setErrorMap({
                onSubmit: {
                  form: 'Please fix the errors below',
                  fields: { slug: 'This slug is already taken' },
                },
              });
              return;
            }

            form.setErrorMap({
              onSubmit: {
                form:
                  errorMessage ||
                  'Something went wrong, please try again later.',
                fields: {},
              },
            });
            return;
          }
          handleSuccess(data);
        },
        onError(error) {
          logError({ message: 'Organization creation failed', error });

          const errorMessage =
            error && typeof error === 'object' && 'message' in error
              ? (error as { message: string }).message
              : '';

          // Check for slug uniqueness error
          if (
            errorMessage.includes('slug') ||
            errorMessage.includes('already taken')
          ) {
            form.setErrorMap({
              onSubmit: {
                form: 'Please fix the errors below',
                fields: { slug: 'This slug is already taken' },
              },
            });
            return;
          }

          form.setErrorMap({
            onSubmit: {
              form:
                errorMessage || 'Something went wrong, please try again later.',
              fields: {},
            },
          });
        },
      });
    },
  });

  return form;
}

export type CreateOrganizationFormType = ReturnType<
  typeof useCreateOrganizationForm
>;
export type CreateOrganizationFormFieldName = keyof CreateOrganizationFormData;
