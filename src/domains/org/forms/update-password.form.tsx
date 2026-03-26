import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@components/ds/atoms/card';
import { Stack } from '@components/ds/atoms/stack';
import { useUpdatePasswordForm } from '@domains/org/forms/hooks/use-update-password-form';
import type { UpdatePasswordFormProps } from '@domains/org/forms/update-password.form.types';

export function UpdatePasswordForm({
  updatePasswordMutation,
  handleSuccess,
}: UpdatePasswordFormProps) {
  const form = useUpdatePasswordForm({ updatePasswordMutation, handleSuccess });
  return (
    <Stack gap="xl">
      <Card>
        <CardHeader>
          <CardTitle>Update your password</CardTitle>
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
              <form.AppField name="password">
                {(field) => (
                  <field.AppFormField
                    label="New password"
                    type="password"
                    placeholder="Password"
                  />
                )}
              </form.AppField>
              <form.AppField name="confirm">
                {(field) => (
                  <field.AppFormField
                    label="Confirm new password"
                    type="password"
                    placeholder="Confirm Password"
                  />
                )}
              </form.AppField>
              <Stack>
                <form.AppForm>
                  <form.AppSubscribeSubmitButton label="Update password" />
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
