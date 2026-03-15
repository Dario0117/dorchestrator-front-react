import { env } from '@lib/env.utils';
import { idempotencyOnRequest } from '@lib/idempotency.middleware';
import { createAuthClient } from 'better-auth/client';
import { emailOTPClient, organizationClient } from 'better-auth/client/plugins';

const BASE_PATH = '/api/v1';

export const authClient = createAuthClient({
  basePath: BASE_PATH,
  baseURL: env.BACKEND_BASE_URL,
  plugins: [emailOTPClient(), organizationClient({ teams: { enabled: true } })],
  fetchOptions: {
    onRequest: idempotencyOnRequest,
  },
});
