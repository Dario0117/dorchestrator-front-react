import { Alert, AlertDescription } from '@components/ds/atoms/alert';
import { LoginForm } from '@components/org/forms/login.form';
import { Route } from '@routes/(unauthenticated)/login';
import { useLoginMutation } from '@services/users/login.http-service';
import { useNavigate } from '@tanstack/react-router';
import { CheckCircle2 } from 'lucide-react';

export function LoginPage() {
  const navigate = useNavigate({ from: '/login' });
  const { registered } = Route.useSearch();

  const login = useLoginMutation();
  return (
    <section className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-4">
          {registered && (
            <Alert className="border-green-500 bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-200">
              <CheckCircle2 className="size-4" />
              <AlertDescription>
                Account created successfully. Please log in.
              </AlertDescription>
            </Alert>
          )}
          <LoginForm
            loginMutation={login}
            handleSuccess={() => {
              navigate({ to: '/' });
            }}
          />
        </div>
      </div>
    </section>
  );
}
