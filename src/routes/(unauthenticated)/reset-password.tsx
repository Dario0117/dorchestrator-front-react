import { ResetPasswordPage } from '@components/org/pages/reset-pw.page';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/(unauthenticated)/reset-password')({
  component: ResetPasswordPage,
});
