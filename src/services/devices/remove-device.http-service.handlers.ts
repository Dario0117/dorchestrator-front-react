import { HttpResponse, http } from 'msw';

export const removeDeviceHandler = http.delete(
  '/api/v1/:organizationId/devices/:deviceId',
  () => {
    return HttpResponse.json({
      responseData: {
        results: ['Device removed successfully'],
      },
      responseErrors: null,
    });
  },
);
