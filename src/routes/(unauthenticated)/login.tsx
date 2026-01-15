import { LoginPage } from '@components/org/pages/login.page';
import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';

const loginSearchSchema = z.object({
  registered: z.boolean().optional(),
});

export const Route = createFileRoute('/(unauthenticated)/login')({
  component: LoginPage,
  validateSearch: loginSearchSchema,
});
