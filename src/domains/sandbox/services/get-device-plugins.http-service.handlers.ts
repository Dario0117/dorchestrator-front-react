import { buildBackendUrl } from '@lib/test-backend-url.utils';
import { HttpResponse, http } from 'msw';

export const getDevicePluginsHandler = http.get<{
  organizationId: string;
  deviceId: string;
}>(
  buildBackendUrl(
    '/api/v1/{organizationId}/devices/{deviceId}/sandbox/plugins',
  ),
  () => {
    return HttpResponse.json({
      responseData: {
        results: [
          {
            id: 1,
            sandboxTypeId: 2,
            source: null,
            version: '1.2.0',
            checksum: null,
            status: 'active',
            statusReason: null,
            installedBy: 'user-123',
            installedAt: new Date(Date.now() - 86400000).toISOString(),
          },
          {
            id: 2,
            sandboxTypeId: 3,
            source: null,
            version: '0.9.1',
            checksum: null,
            status: 'inactive',
            statusReason: null,
            installedBy: 'user-123',
            installedAt: new Date(Date.now() - 172800000).toISOString(),
          },
        ],
      },
      responseErrors: null,
    });
  },
);
