import { buildBackendUrl } from '@lib/test-backend-url.utils';
import { HttpResponse, http } from 'msw';
import type { operations } from '@/types/api.generated.types';

type SignUpSuccessResponse =
  operations['signUpWithEmailAndPassword']['responses']['200']['content']['application/json'];

export const registerHandler = http.post<never, never, SignUpSuccessResponse>(
  buildBackendUrl('/api/v1/sign-up/email'),
  () => {
    return HttpResponse.json(
      {
        user: {
          id: 'test-user-id',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
          email: 'test@example.com',
          emailVerified: false,
          name: 'Test User',
          image: undefined,
        },
        token: null,
      },
      { status: 201 },
    );
  },
);
