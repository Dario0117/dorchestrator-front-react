import { buildBackendUrl } from '@lib/test.utils';
import { HttpResponse, http } from 'msw';
import type { operations } from '@/types/api.generated.types';

type SuccessResponse =
  operations['getApiV1ByOrganizationIdTerminalConfigEffectiveByDeviceId']['responses']['200']['content']['application/json'];

export const getEffectiveCeilingHandler = http.get<
  never,
  never,
  SuccessResponse
>(
  buildBackendUrl(
    '/api/v1/{organizationId}/terminal/config/effective/{deviceId}',
  ),
  () => {
    return HttpResponse.json({
      responseData: {
        results: {
          effectiveInactivityCeilingMs: 3_600_000,
          effectiveHardCapCeilingMs: null,
          source: 'system_default',
        },
      },
      responseErrors: null,
    });
  },
);
