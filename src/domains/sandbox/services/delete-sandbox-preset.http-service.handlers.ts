import { buildBackendUrl } from '@lib/test-backend-url.utils';
import { HttpResponse, http } from 'msw';
import type { operations } from '@/types/api.generated.types';

type DeletePresetPathParams =
  operations['deleteApiV1ByOrganizationIdSandboxPresetsByPresetId']['parameters']['path'];
type DeletePresetSuccessResponse =
  operations['deleteApiV1ByOrganizationIdSandboxPresetsByPresetId']['responses']['200']['content']['application/json'];

export const deleteSandboxPresetHandler = http.delete<
  DeletePresetPathParams,
  never,
  DeletePresetSuccessResponse
>(
  buildBackendUrl('/api/v1/{organizationId}/sandbox/presets/{presetId}'),
  () => {
    return HttpResponse.json({
      responseData: {
        results: ['Preset deleted successfully'],
      },
      responseErrors: null,
    });
  },
);
