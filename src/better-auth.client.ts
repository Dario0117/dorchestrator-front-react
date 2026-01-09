import { createAuthClient } from 'better-auth/client';
import { emailOTPClient, organizationClient } from 'better-auth/client/plugins';

const BASE_PATH = '/api/v1';

export const authClient = createAuthClient({
  basePath: BASE_PATH,
  baseURL: import.meta.env.BACKEND_BASE_URL ?? 'http://localhost:9000',
  plugins: [emailOTPClient(), organizationClient()],
});
