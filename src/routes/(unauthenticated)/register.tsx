import { RegisterPage } from '@components/org/pages/register.page';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/(unauthenticated)/register')({
  component: RegisterPage,
});
