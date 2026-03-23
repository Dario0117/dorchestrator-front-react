import { buildBackendUrl } from '@lib/test-backend-url.utils';
import { HttpResponse, http } from 'msw';
import type { operations } from '@/types/api.generated.types';

type SignOutSuccessResponse =
  operations['signOut']['responses']['200']['content']['application/json'];

export const logoutHandler = http.post<never, never, SignOutSuccessResponse>(
  buildBackendUrl('/api/v1/sign-out'),
  () => {
    return HttpResponse.json({
      success: true,
    });
  },
);
