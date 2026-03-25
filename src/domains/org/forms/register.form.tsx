import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@components/ds/atoms/card';
import { Stack } from '@components/ds/atoms/stack';
import { useRegisterForm } from '@domains/org/forms/hooks/use-register-form';
import type { RegisterFormProps } from '@domains/org/forms/register.form.types';

export function RegisterForm({
  registerMutation,
  handleSuccess,
}: RegisterFormProps) {
  const form = useRegisterForm({ registerMutation, handleSuccess });

  return (
    <Stack gap="xl">
      <Card>
        <CardHeader>
          <CardTitle>Create your account</CardTitle>
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
              <form.AppField name="name">
                {(field) => (
                  <field.AppFormField
                    label="Name"
                    placeholder="John Doe"
                    required
                  />
                )}
              </form.AppField>
              <form.AppField name="email">
                {(field) => (
                  <field.AppFormField
                    label="Email"
                    placeholder="johndoe17@mail.com"
                    required
                  />
                )}
              </form.AppField>
              <form.AppField name="password">
                {(field) => (
                  <field.AppFormField
                    label="Password"
                    type="password"
                    placeholder="Password"
                    required
                  />
                )}
              </form.AppField>
              <form.AppField name="confirm">
                {(field) => (
                  <field.AppFormField
                    label="Confirm Password"
                    type="password"
                    placeholder="Confirm Password"
                    required
                  />
                )}
              </form.AppField>
              <Stack>
                <form.AppForm>
                  <form.AppSubscribeSubmitButton label="Register" />
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
