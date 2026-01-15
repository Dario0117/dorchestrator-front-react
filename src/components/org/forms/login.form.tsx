import { useLoginForm } from '@components/org/forms/hooks/use-login-form';
import type { LoginFormProps } from '@components/org/forms/login.form.types';
import { loginFormSchema } from '@components/org/forms/validation/login-form.schema';
import { FormCard } from '@components/ui/form-card';
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
        <div className="flex flex-col gap-6">
          <form.AppField
            name="email"
            validators={{
              onBlur: loginFormSchema.shape.email,
            }}
          >
            {(field) => (
              <field.AppFormField
                label="Email"
                placeholder="johndoe17@mail.com"
                required
              />
            )}
          </form.AppField>

          <form.AppField
            name="password"
            validators={{
              onBlur: loginFormSchema.shape.password,
            }}
          >
            {(field) => (
              <field.AppFormField
                label="Password"
                type="password"
                placeholder="Password"
                required
              />
            )}
          </form.AppField>

          <div className="flex flex-col gap-3">
            <form.AppForm>
              <form.AppSubscribeSubmitButton label="Login" />
            </form.AppForm>
          </div>
        </div>

        <form.AppForm>
          <form.AppSubscribeErrorButton />
        </form.AppForm>

        <div className="mt-4 text-center text-sm">
          <Link
            to="/reset-password"
            className="underline-offset-4 hover:underline"
          >
            Forgot your password?
          </Link>
        </div>

        <div className="mt-4 text-center text-sm">
          Don&apos;t have an account?{' '}
          <Link
            to="/register"
            className="underline-offset-4 hover:underline"
          >
            Register
          </Link>
        </div>
      </form>
    </FormCard>
  );
}
