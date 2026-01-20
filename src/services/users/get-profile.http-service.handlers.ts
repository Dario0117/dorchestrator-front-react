import { buildBackendUrl } from '@lib/test.utils';
import { HttpResponse, http } from 'msw';
import type { operations } from '@/types/api.generated.types';

type GetSessionResponse =
  operations['getSession']['responses']['200']['content']['application/json'];

export const getProfileHandler = http.get<never, never, GetSessionResponse>(
  buildBackendUrl('/api/v1/get-session'),
  () => {
    return HttpResponse.json({
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
      session: {
        id: 'test-session-id',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
        userId: 'test-user-id',
        expiresAt: '2025-01-01T00:00:00.000Z',
        token: 'test-session-token',
        ipAddress: '127.0.0.1',
        userAgent: 'test-agent',
      },
    });
  },
);
