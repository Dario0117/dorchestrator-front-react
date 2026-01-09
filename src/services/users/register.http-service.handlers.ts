import { buildBackendUrl } from '@lib/test.utils';
import type { User } from 'better-auth/client';
import { HttpResponse, http } from 'msw';

type SignUpResponse = {
  user: User;
  token: null | string;
};

export const registerHandler = http.post(
  buildBackendUrl('/api/v1/sign-up/email'),
  () => {
    const data: SignUpResponse = {
      user: {
        id: 'test-user-id',
        createdAt: new Date(),
        updatedAt: new Date(),
        email: 'test@example.com',
        emailVerified: false,
        name: 'Test User',
        image: null,
      },
      token: null,
    };
    return HttpResponse.json(data, { status: 201 });
  },
);
