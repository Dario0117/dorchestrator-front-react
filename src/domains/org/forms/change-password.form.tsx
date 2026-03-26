import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@components/ds/atoms/card';
import { Stack } from '@components/ds/atoms/stack';
import type { ChangePasswordFormProps } from '@domains/org/forms/change-password.form.types';
import { useChangePasswordForm } from '@domains/org/forms/hooks/use-change-password-form';

export function ChangePasswordForm({
  changePasswordMutation,
  handleSuccess,
}: ChangePasswordFormProps) {
  const form = useChangePasswordForm({ changePasswordMutation, handleSuccess });
  return (
    <Card>
      <CardHeader>
        <CardTitle>Change Password</CardTitle>
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
            <form.AppField name="currentPassword">
              {(field) => (
                <field.AppFormField
                  label="Current password"
                  type="password"
                  placeholder="Current password"
                />
              )}
            </form.AppField>
            <form.AppField name="newPassword">
              {(field) => (
                <field.AppFormField
                  label="New password"
                  type="password"
                  placeholder="New password"
                />
              )}
            </form.AppField>
            <form.AppField name="confirm">
              {(field) => (
                <field.AppFormField
                  label="Confirm new password"
                  type="password"
                  placeholder="Confirm new password"
                />
              )}
            </form.AppField>
            <Stack>
              <form.AppForm>
                <form.AppSubscribeSubmitButton label="Change password" />
              </form.AppForm>
            </Stack>
          </Stack>

          <form.AppForm>
            <form.AppSubscribeErrorButton />
          </form.AppForm>
        </form>
      </CardContent>
    </Card>
  );
}
