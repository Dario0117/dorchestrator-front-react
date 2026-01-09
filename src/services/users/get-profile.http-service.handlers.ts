import type { Session, User } from 'better-auth/client';
import { HttpResponse, http } from 'msw';
import { buildBackendUrl } from '@/lib/test.utils';

type GetSessionResponse = {
  user: User;
  session: Session;
};

export const getProfileHandler = http.get(
  buildBackendUrl('/api/v1/get-session'),
  () => {
    const data: GetSessionResponse = {
      user: {
        id: 'test-user-id',
        createdAt: new Date(),
        updatedAt: new Date(),
        email: 'test@example.com',
        emailVerified: true,
        name: 'Test User',
        image: null,
      },
      session: {
        id: 'test-session-id',
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: 'test-user-id',
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
        token: 'test-session-token',
        ipAddress: '127.0.0.1',
        userAgent: 'test-agent',
      },
    };
    return HttpResponse.json(data);
  },
);
