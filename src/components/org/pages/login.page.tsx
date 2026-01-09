import { useNavigate } from '@tanstack/react-router';
import { LoginForm } from '@/components/org/forms/login.form';
import { useLoginMutation } from '@/services/users/login.http-service';

export function LoginPage() {
  const navigate = useNavigate({ from: '/login' });

  const login = useLoginMutation();
  return (
    <section className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm
          loginMutation={login}
          handleSuccess={() => {
            navigate({ to: '/' });
          }}
        />
      </div>
    </section>
  );
}
