import { SecondaryParagraph } from '@components/ds/atoms/secondary-paragraph';
import { useCreateOrganizationForm } from '@components/org/forms/hooks/use-create-organization-form';
import {
  SlugStatus,
  useSlugValidation,
} from '@components/org/forms/hooks/use-slug-validation';
import { Button } from '@components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card';
import {
  generateInitials,
  generateSlugSuggestion,
} from '@lib/organization-logo.utils';
import type { useCreateOrganizationMutationType } from '@services/organizations/create-organization.http-service';
import { useEffect, useState } from 'react';

interface CreateOrganizationFormProps {
  createOrganizationMutation: useCreateOrganizationMutationType;
  handleSuccess: (
    data: NonNullable<useCreateOrganizationMutationType['data']>,
  ) => void;
}

export function CreateOrganizationForm({
  createOrganizationMutation,
  handleSuccess,
}: CreateOrganizationFormProps) {
  const form = useCreateOrganizationForm({
    createOrganizationMutation,
    handleSuccess,
  });

  const {
    currentSlug,
    status: slugStatus,
    isSlugValid,
    isChecking,
    resetValidation,
    checkSlugAvailability,
  } = useSlugValidation();

  const [orgName, setOrgName] = useState('');
  const [initials, setInitials] = useState('');

  // Update initials when organization name changes
  useEffect(() => {
    const newInitials = generateInitials(orgName);
    setInitials(newInitials);
  }, [orgName]);

  const handleCheckSlug = async () => {
    const slugValue = form.getFieldValue('slug');
    await checkSlugAvailability(slugValue);
  };

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Create Your Organization</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
          >
            <div className="flex flex-col gap-6">
              {/* Logo Preview */}
              <div className="flex justify-center">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary text-4xl font-bold text-primary-foreground">
                  {initials || '?'}
                </div>
              </div>

              <SecondaryParagraph className="text-center">
                Your organization logo will display the initials above
              </SecondaryParagraph>

              {/* Organization Name Field */}
              <form.AppField name="name">
                {(field) => (
                  <field.AppFormField
                    label="Organization Name"
                    placeholder="Acme Corporation"
                    required
                    onChange={(e) => {
                      const value = e.target.value;
                      setOrgName(value);

                      // Auto-generate slug suggestion when name changes
                      const slugSuggestion = generateSlugSuggestion(value);
                      if (slugSuggestion) {
                        form.setFieldValue('slug', slugSuggestion);
                        resetValidation(slugSuggestion);
                      }
                    }}
                  />
                )}
              </form.AppField>

              {/* Organization Slug Field */}
              <form.AppField name="slug">
                {(field) => (
                  <div className="space-y-2">
                    <field.AppFormField
                      label="Organization Slug"
                      placeholder="acme-corporation"
                      required
                      helperText="Used in URLs. Only lowercase letters, numbers, and hyphens."
                      onChange={(e) => {
                        resetValidation(e.target.value);
                      }}
                    />
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleCheckSlug}
                        disabled={isChecking || !currentSlug}
                      >
                        {isChecking ? 'Checking...' : 'Check Availability'}
                      </Button>
                      {slugStatus === SlugStatus.AVAILABLE && (
                        <span className="text-sm text-green-600">
                          ✓ Slug is available
                        </span>
                      )}
                      {slugStatus === SlugStatus.TAKEN && (
                        <span className="text-sm text-red-600">
                          ✗ Slug is already taken
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </form.AppField>

              <div className="flex flex-col gap-3">
                <form.AppForm>
                  <form.AppSubscribeSubmitButton
                    label="Create Organization"
                    disabled={!isSlugValid}
                  />
                </form.AppForm>
              </div>
            </div>
            <form.AppForm>
              <form.AppSubscribeErrorButton />
            </form.AppForm>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
