import { Box } from '@components/ds/atoms/box';
import { PageSection } from '@components/ds/atoms/page-section';
import { showToast } from '@components/ds/atoms/toast';
import { ResetPasswordForm } from '@domains/org/forms/reset-password.form';
import { useResetPasswordMutation } from '@domains/org/services/users/reset-password.http-service';
import { useNavigate } from '@tanstack/react-router';

export function ResetPasswordPage() {
  const navigate = useNavigate({ from: '/reset-password' });
  const resetPassword = useResetPasswordMutation();
  return (
    <PageSection centered>
      <Box
        fullWidth
        maxWidth="sm"
      >
        <ResetPasswordForm
          resetPasswordMutation={resetPassword}
          handleSuccess={(data) => {
            const message =
              data && typeof data === 'object' && 'message' in data
                ? (data as { message: string }).message
                : 'Check your email for a link to reset your password.';
            showToast.success(message);
            navigate({ to: '/login' });
          }}
        />
      </Box>
    </PageSection>
  );
}
