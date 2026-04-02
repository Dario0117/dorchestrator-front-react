import { buildBackendUrl } from '@lib/test-backend-url.utils';
import { HttpResponse, http } from 'msw';
import type { operations } from '@/types/api.generated.types';

type UpdatePresetPathParams =
  operations['putApiV1ByOrganizationIdSandboxPresetsByPresetId']['parameters']['path'];
type UpdatePresetSuccessResponse =
  operations['putApiV1ByOrganizationIdSandboxPresetsByPresetId']['responses']['200']['content']['application/json'];

export const updateSandboxPresetHandler = http.put<
  UpdatePresetPathParams,
  never,
  UpdatePresetSuccessResponse
>(
  buildBackendUrl('/api/v1/{organizationId}/sandbox/presets/{presetId}'),
  ({ params }) => {
    return HttpResponse.json({
      responseData: {
        results: {
          id: Number(params.presetId),
          organizationId: String(params.organizationId),
          name: 'Updated Preset',
          description: 'Updated description',
          sandboxTypeId: 2,
          networkPolicy: {
            mode: 'allow-all',
            allow: undefined,
            deny: undefined,
          },
          resourceLimits: {
            maxTimeoutMs: 30000,
            maxOutputSize: 1048576,
            pidsLimit: 100,
          },
          volumeMounts: null,
          pluginConfig: { image: 'dorchestrator/sandbox:latest' },
          isOrgDefault: false,
          requiresApproval: false,
          createdBy: 'user-123',
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: new Date().toISOString(),
        },
      },
      responseErrors: null,
    });
  },
);
