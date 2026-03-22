import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@components/ds/atoms/card';
import { useResetPasswordForm } from '@components/org/forms/hooks/use-reset-password-form';
import type { ResetPasswordFormProps } from '@components/org/forms/reset-password.form.types';

export function ResetPasswordForm({
  resetPasswordMutation,
  handleSuccess,
}: ResetPasswordFormProps) {
  const form = useResetPasswordForm({ resetPasswordMutation, handleSuccess });
  return (
    <div className="flex flex-col gap-6">
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
            <div className="flex flex-col gap-6">
              <form.AppField name="email">
                {(field) => (
                  <field.AppFormField
                    label="Email"
                    placeholder="johndoe17@mail.com"
                    required
                  />
                )}
              </form.AppField>
              <div className="flex flex-col gap-3">
                <form.AppForm>
                  <form.AppSubscribeSubmitButton label="Send reset email" />
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
