import { Button } from '@components/ds/atoms/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@components/ds/atoms/card';
import { Flex } from '@components/ds/atoms/flex';
import { HStack } from '@components/ds/atoms/hstack';
import { SecondaryParagraph } from '@components/ds/atoms/secondary-paragraph';
import { SmallText } from '@components/ds/atoms/small-text';
import { Stack } from '@components/ds/atoms/stack';
import { OrgInitialsAvatar } from '@domains/org/forms/components/org-initials-avatar';
import { useCreateOrganizationForm } from '@domains/org/forms/hooks/use-create-organization-form';
import {
  SlugStatus,
  useSlugValidation,
} from '@domains/org/forms/hooks/use-slug-validation';
import type { useCreateOrganizationMutationType } from '@domains/org/services/organizations/create-organization.http-service';
import {
  generateInitials,
  generateSlugSuggestion,
} from '@lib/organization-logo.utils';
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
    <Stack gap="xl">
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
            <Stack gap="xl">
              {/* Logo Preview */}
              <Flex justify="center">
                <OrgInitialsAvatar initials={initials || '?'} />
              </Flex>

              <SecondaryParagraph centered>
                Your organization logo will display the initials above
              </SecondaryParagraph>

              {/* Organization Name Field */}
              <form.AppField name="name">
                {(field) => (
                  <field.AppFormField
                    label="Organization Name"
                    placeholder="Acme Corporation"
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
                  <Stack gap="sm">
                    <field.AppFormField
                      label="Organization Slug"
                      placeholder="acme-corporation"
                      helperText="Used in URLs. Only lowercase letters, numbers, and hyphens."
                      onChange={(e) => {
                        resetValidation(e.target.value);
                      }}
                    />
                    <HStack gap="sm">
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
                        <SmallText
                          size="sm"
                          color="success"
                        >
                          ✓ Slug is available
                        </SmallText>
                      )}
                      {slugStatus === SlugStatus.TAKEN && (
                        <SmallText
                          size="sm"
                          color="destructive"
                        >
                          ✗ Slug is already taken
                        </SmallText>
                      )}
                    </HStack>
                  </Stack>
                )}
              </form.AppField>

              <Stack>
                <form.AppForm>
                  <form.AppSubscribeSubmitButton
                    label="Create Organization"
                    disabled={!isSlugValid}
                  />
                </form.AppForm>
              </Stack>
            </Stack>
            <form.AppForm>
              <form.AppSubscribeErrorButton />
            </form.AppForm>
          </form>
        </CardContent>
      </Card>
    </Stack>
  );
}
