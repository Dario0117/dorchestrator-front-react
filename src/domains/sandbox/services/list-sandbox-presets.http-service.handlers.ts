import { buildBackendUrl } from '@lib/test-backend-url.utils';
import { HttpResponse, http } from 'msw';
import type { operations } from '@/types/api.generated.types';

type ListPresetsPathParams =
  operations['getApiV1ByOrganizationIdSandboxPresets']['parameters']['path'];
type ListPresetsSuccessResponse =
  operations['getApiV1ByOrganizationIdSandboxPresets']['responses']['200']['content']['application/json'];

export const listSandboxPresetsHandler = http.get<
  ListPresetsPathParams,
  never,
  ListPresetsSuccessResponse
>(buildBackendUrl('/api/v1/{organizationId}/sandbox/presets'), () => {
  return HttpResponse.json({
    responseData: {
      results: [
        {
          id: 1,
          organizationId: 'org-123',
          name: 'Default Docker',
          description: 'Standard Docker sandbox with allow-all networking',
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
          isOrgDefault: true,
          requiresApproval: false,
          createdBy: 'user-123',
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-01T00:00:00.000Z',
        },
        {
          id: 2,
          organizationId: 'org-123',
          name: 'Restricted Docker',
          description: 'Docker sandbox with restricted networking',
          sandboxTypeId: 2,
          networkPolicy: {
            mode: 'allow-list',
            allow: {
              external: [{ host: 'registry.npmjs.org', ports: [443] }],
              local: [],
            },
            deny: undefined,
          },
          resourceLimits: {
            maxTimeoutMs: 60000,
            maxOutputSize: 2097152,
            pidsLimit: 50,
          },
          volumeMounts: null,
          pluginConfig: { image: 'dorchestrator/sandbox:latest' },
          isOrgDefault: false,
          requiresApproval: true,
          createdBy: 'user-123',
          createdAt: '2026-01-15T00:00:00.000Z',
          updatedAt: '2026-01-15T00:00:00.000Z',
        },
        {
          id: 3,
          organizationId: 'org-123',
          name: 'No Sandbox',
          description: 'Direct host execution with no isolation',
          sandboxTypeId: 1,
          networkPolicy: null,
          resourceLimits: null,
          volumeMounts: null,
          pluginConfig: null,
          isOrgDefault: false,
          requiresApproval: true,
          createdBy: 'user-123',
          createdAt: '2026-02-01T00:00:00.000Z',
          updatedAt: '2026-02-01T00:00:00.000Z',
        },
      ],
    },
    responseErrors: null,
  });
});
