import { Box } from '@components/ds/atoms/box';
import { PageSection } from '@components/ds/atoms/page-section';
import { UpdatePasswordForm } from '@domains/org/forms/update-password.form';
import { useUpdatePasswordMutation } from '@domains/org/services/users/update-password.http-service';
import { useNavigate } from '@tanstack/react-router';

export function UpdatePasswordPage({ token }: { token: string }) {
  const navigate = useNavigate({
    from: '/update-password',
  });
  const updatePassword = useUpdatePasswordMutation(token);
  return (
    <PageSection centered>
      <Box
        fullWidth
        maxWidth="sm"
      >
        <UpdatePasswordForm
          updatePasswordMutation={updatePassword}
          handleSuccess={() => {
            navigate({ to: '/login' });
          }}
        />
      </Box>
    </PageSection>
  );
}
