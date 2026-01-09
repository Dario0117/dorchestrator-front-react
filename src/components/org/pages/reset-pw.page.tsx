import { ResetPasswordForm } from '@components/org/forms/reset-password.form';
import { useResetPasswordMutation } from '@services/users/reset-password.http-service';
import { useNavigate } from '@tanstack/react-router';

export function ResetPasswordPage() {
  const navigate = useNavigate({ from: '/reset-password' });
  const resetPassword = useResetPasswordMutation();
  return (
    <section className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <ResetPasswordForm
          resetPasswordMutation={resetPassword}
          handleSuccess={() => {
            navigate({ to: '/login' });
          }}
        />
      </div>
    </section>
  );
}
