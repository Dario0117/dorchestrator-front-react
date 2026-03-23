import { Box } from '@components/ds/atoms/box';
import { PageSection } from '@components/ds/atoms/page-section';
import { RegisterForm } from '@domains/org/forms/register.form';
import { useRegisterMutation } from '@domains/org/services/users/register.http-service';
import { useNavigate } from '@tanstack/react-router';

export function RegisterPage() {
  const navigate = useNavigate({ from: '/register' });

  const register = useRegisterMutation();
  return (
    <PageSection centered>
      <Box
        fullWidth
        maxWidth="sm"
      >
        <RegisterForm
          registerMutation={register}
          handleSuccess={() => {
            navigate({
              to: '/login',
              search: { registered: true },
            });
          }}
        />
      </Box>
    </PageSection>
  );
}
