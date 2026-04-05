import { buildBackendUrl } from '@lib/test-backend-url.utils';
import { HttpResponse, http } from 'msw';
import type { operations } from '@/types/api.generated.types';

type CreatePresetPathParams =
  operations['postApiV1ByOrganizationIdSandboxPresets']['parameters']['path'];
type CreatePresetRequestBody =
  operations['postApiV1ByOrganizationIdSandboxPresets']['requestBody']['content']['application/json'];
type CreatePresetSuccessResponse =
  operations['postApiV1ByOrganizationIdSandboxPresets']['responses']['201']['content']['application/json'];

export const createSandboxPresetHandler = http.post<
  CreatePresetPathParams,
  CreatePresetRequestBody,
  CreatePresetSuccessResponse
>(
  buildBackendUrl('/api/v1/{organizationId}/sandbox/presets'),
  async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json(
      {
        responseData: {
          results: {
            id: 99,
            organizationId: 'org-123',
            name: body.name,
            description: body.description ?? null,
            sandboxTypeId: body.sandboxTypeId,
            networkPolicy: body.networkPolicy ?? null,
            resourceLimits: body.resourceLimits ?? null,
            volumeMounts: body.volumeMounts ?? null,
            providerConfig: body.providerConfig ?? null,
            isOrgDefault: false,
            requiresApproval: body.requiresApproval ?? false,
            createdBy: 'user-123',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        },
        responseErrors: null,
      },
      { status: 201 },
    );
  },
);
