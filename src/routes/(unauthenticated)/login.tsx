import { LoginPage } from '@components/org/pages/login.page';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/(unauthenticated)/login')({
  component: LoginPage,
});
