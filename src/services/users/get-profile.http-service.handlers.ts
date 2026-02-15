import { buildBackendUrl } from '@lib/test.utils';
import { HttpResponse, http } from 'msw';

export const getProfileHandler = http.get(buildBackendUrl('/api/v1/me'), () => {
  return HttpResponse.json({
    responseData: {
      results: {
        id: 'test-user-id',
        name: 'Test User',
        email: 'test@example.com',
        emailVerified: true,
        image: null,
        createdAt: '2024-01-01T00:00:00.000Z',
      },
    },
    responseErrors: null,
  });
});
