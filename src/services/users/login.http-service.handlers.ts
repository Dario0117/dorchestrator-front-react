import { buildBackendUrl } from '@lib/test.utils';
import { HttpResponse, http } from 'msw';
import type { operations } from '@/types/api.generated.types';

type SignInRequestBody =
  operations['signInEmail']['requestBody']['content']['application/json'];
type SignInSuccessResponse =
  operations['signInEmail']['responses']['200']['content']['application/json'];

export const loginHandler = http.post<
  never,
  SignInRequestBody,
  SignInSuccessResponse
>(buildBackendUrl('/api/v1/sign-in/email'), () => {
  return HttpResponse.json({
    redirect: false,
    token: 'random-token',
    user: {
      id: 'test-user-id',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
      email: 'test@example.com',
      emailVerified: true,
      name: 'Test User',
      image: undefined,
      banned: false,
    },
  });
});
