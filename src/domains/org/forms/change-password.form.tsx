import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@components/ds/atoms/card';
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
          <div className="flex flex-col gap-6">
            <form.AppField name="currentPassword">
              {(field) => (
                <field.AppFormField
                  label="Current password"
                  type="password"
                  placeholder="Current password"
                  required
                />
              )}
            </form.AppField>
            <form.AppField name="newPassword">
              {(field) => (
                <field.AppFormField
                  label="New password"
                  type="password"
                  placeholder="New password"
                  required
                />
              )}
            </form.AppField>
            <form.AppField name="confirm">
              {(field) => (
                <field.AppFormField
                  label="Confirm new password"
                  type="password"
                  placeholder="Confirm new password"
                  required
                />
              )}
            </form.AppField>
            <div className="flex flex-col gap-3">
              <form.AppForm>
                <form.AppSubscribeSubmitButton label="Change password" />
              </form.AppForm>
            </div>
          </div>

          <form.AppForm>
            <form.AppSubscribeErrorButton />
          </form.AppForm>
        </form>
      </CardContent>
    </Card>
  );
}
