import { Box } from '@components/ds/atoms/box';
import { PageSection } from '@components/ds/atoms/page-section';
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
          handleSuccess={() => {
            navigate({ to: '/login' });
          }}
        />
      </Box>
    </PageSection>
  );
}
