import { APP_LINK_VARIANT } from '@components/ds/atoms/app-link';
import { FormCard } from '@components/ds/atoms/form-card';
import { SmallText } from '@components/ds/atoms/small-text';
import { Stack } from '@components/ds/atoms/stack';
import { useLoginForm } from '@domains/org/forms/hooks/use-login-form';
import type { LoginFormProps } from '@domains/org/forms/login.form.types';
import { Link } from '@tanstack/react-router';

export function LoginForm({ loginMutation, handleSuccess }: LoginFormProps) {
  const form = useLoginForm({ loginMutation, handleSuccess });

  return (
    <FormCard
      title="Login to your account"
      description="Enter your email below to login to your account"
    >
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

          <form.AppField name="password">
            {(field) => (
              <field.AppFormField
                label="Password"
                type="password"
                placeholder="Password"
              />
            )}
          </form.AppField>

          <Stack>
            <form.AppForm>
              <form.AppSubscribeSubmitButton label="Login" />
            </form.AppForm>
          </Stack>
        </Stack>

        <form.AppForm>
          <form.AppSubscribeErrorButton />
        </form.AppForm>

        <Stack
          gap="none"
          textAlign="center"
        >
          <SmallText
            color="muted"
            size="sm"
            spaceAbove="lg"
          >
            <Link
              className={APP_LINK_VARIANT.underline}
              to="/reset-password"
            >
              Forgot your password?
            </Link>
          </SmallText>
        </Stack>

        <Stack
          gap="none"
          textAlign="center"
        >
          <SmallText
            color="muted"
            size="sm"
            spaceAbove="lg"
          >
            Don&apos;t have an account?{' '}
            <Link
              className={APP_LINK_VARIANT.underline}
              to="/register"
            >
              Register
            </Link>
          </SmallText>
        </Stack>
      </form>
    </FormCard>
  );
}
