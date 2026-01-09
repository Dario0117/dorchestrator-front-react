import { HttpResponse, http } from 'msw';

export const generateDeviceTokenHandler = http.post(
  '/api/v1/:organizationId/devices',
  () => {
    return HttpResponse.json({
      responseData: {
        results: {
          token: 'test-token-12345-abcdef-67890',
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        },
      },
      responseErrors: null,
    });
  },
);
