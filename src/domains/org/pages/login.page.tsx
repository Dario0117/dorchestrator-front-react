import { Alert, AlertDescription } from '@components/ds/atoms/alert';
import { Box } from '@components/ds/atoms/box';
import { PageSection } from '@components/ds/atoms/page-section';
import { Stack } from '@components/ds/atoms/stack';
import { LoginForm } from '@domains/org/forms/login.form';
import { useLoginMutation } from '@domains/org/services/users/login.http-service';
import { useNavigationStore } from '@domains/shared/stores/navigation.store';
import { Route } from '@routes/(unauthenticated)/login';
import { useNavigate } from '@tanstack/react-router';
import { CheckCircle2 } from 'lucide-react';

export function LoginPage() {
  const navigate = useNavigate({ from: '/login' });
  const { registered } = Route.useSearch();

  const login = useLoginMutation();
  return (
    <PageSection centered>
      <Box
        fullWidth
        maxWidth="sm"
      >
        <Stack gap="lg">
          {registered && (
            <Alert colorVariant="success">
              <CheckCircle2 className="size-4" />
              <AlertDescription>
                Account created successfully. Please log in.
              </AlertDescription>
            </Alert>
          )}
          <LoginForm
            loginMutation={login}
            handleSuccess={() => {
              useNavigationStore.getState().clear();
              navigate({ to: '/' });
            }}
          />
        </Stack>
      </Box>
    </PageSection>
  );
}
