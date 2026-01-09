import type { User } from 'better-auth/client';
import { HttpResponse, http } from 'msw';
import { buildBackendUrl } from '@/lib/test.utils';

type SignInResponse = {
  redirect: boolean;
  token: string;
  user: User;
};

export const loginHandler = http.post(
  buildBackendUrl('/api/v1/sign-in/email'),
  () => {
    const data: SignInResponse = {
      redirect: false,
      token: 'random-token',
      user: {
        id: 'test-user-id',
        createdAt: new Date(),
        updatedAt: new Date(),
        email: 'test@example.com',
        emailVerified: true,
        name: 'Test User',
        image: null,
      },
    };
    return HttpResponse.json(data);
  },
);
