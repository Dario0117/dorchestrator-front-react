import { buildBackendUrl } from '@lib/test-backend-url.utils';
import { HttpResponse, http } from 'msw';
import type { operations } from '@/types/api.generated.types';

type SetDefaultPathParams =
  operations['patchApiV1ByOrganizationIdSandboxPresetsByPresetIdSet-default']['parameters']['path'];
type SetDefaultSuccessResponse =
  operations['patchApiV1ByOrganizationIdSandboxPresetsByPresetIdSet-default']['responses']['200']['content']['application/json'];

export const setOrgDefaultPresetHandler = http.patch<
  SetDefaultPathParams,
  never,
  SetDefaultSuccessResponse
>(
  buildBackendUrl(
    '/api/v1/{organizationId}/sandbox/presets/{presetId}/set-default',
  ),
  () => {
    return HttpResponse.json({
      responseData: {
        results: ['Default preset updated'],
      },
      responseErrors: null,
    });
  },
);
