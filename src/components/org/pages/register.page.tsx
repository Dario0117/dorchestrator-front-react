import { useNavigate } from '@tanstack/react-router';
import { RegisterForm } from '@/components/org/forms/register.form';
import { useRegisterMutation } from '@/services/users/register.http-service';

export function RegisterPage() {
  const navigate = useNavigate({ from: '/register' });

  const register = useRegisterMutation();
  return (
    <section className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <RegisterForm
          registerMutation={register}
          handleSuccess={() => {
            navigate({ to: '/login' });
          }}
        />
      </div>
    </section>
  );
}
