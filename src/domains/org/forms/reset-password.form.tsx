import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@components/ds/atoms/card';
import { Stack } from '@components/ds/atoms/stack';
import { useResetPasswordForm } from '@domains/org/forms/hooks/use-reset-password-form';
import type { ResetPasswordFormProps } from '@domains/org/forms/reset-password.form.types';

export function ResetPasswordForm({
  resetPasswordMutation,
  handleSuccess,
}: ResetPasswordFormProps) {
  const form = useResetPasswordForm({ resetPasswordMutation, handleSuccess });
  return (
    <Stack gap="xl">
      <Card>
        <CardHeader>
          <CardTitle>Reset your password</CardTitle>
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
              <form.AppField name="email">
                {(field) => (
                  <field.AppFormField
                    label="Email"
                    placeholder="johndoe17@mail.com"
                  />
                )}
              </form.AppField>
              <Stack>
                <form.AppForm>
                  <form.AppSubscribeSubmitButton label="Send reset email" />
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
