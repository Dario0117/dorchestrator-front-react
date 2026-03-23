import { UpdatePasswordPage } from '@domains/org/pages/update-pw.page';
import { createFileRoute, Navigate } from '@tanstack/react-router';
import { z } from 'zod/v4';

const searchParamsSchema = z.object({
  token: z.string().min(1),
});

export const Route = createFileRoute('/(unauthenticated)/update-password')({
  validateSearch: searchParamsSchema,
  component: ValidatedUpdatePasswordPage,
  errorComponent: () => (
    <Navigate
      to="/login"
      replace
    />
  ),
});

function ValidatedUpdatePasswordPage() {
  const { token } = Route.useSearch();
  return <UpdatePasswordPage token={token} />;
}
