import { useUpdatePasswordForm } from '@components/org/forms/hooks/use-update-password-form';
import type { UpdatePasswordFormProps } from '@components/org/forms/update-password.form.types';
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card';

export function UpdatePasswordForm({
  updatePasswordMutation,
  handleSuccess,
}: UpdatePasswordFormProps) {
  const form = useUpdatePasswordForm({ updatePasswordMutation, handleSuccess });
  return (
    <div className="flex flex-col gap-6">
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
            <div className="flex flex-col gap-6">
              <form.AppField name="password">
                {(field) => (
                  <field.AppFormField
                    label="New password"
                    type="password"
                    placeholder="Password"
                    required
                  />
                )}
              </form.AppField>
              <form.AppField name="confirm">
                {(field) => (
                  <field.AppFormField
                    label="Confirm new password"
                    type="password"
                    placeholder="Confirm Password"
                    required
                  />
                )}
              </form.AppField>
              <div className="flex flex-col gap-3">
                <form.AppForm>
                  <form.AppSubscribeSubmitButton label="Update password" />
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
