import { buildBackendUrl } from '@lib/test-backend-url.utils';
import { HttpResponse, http } from 'msw';

export const listMySandboxApprovalsHandler = http.get<{
  organizationId: string;
  teamId: string;
}>(
  buildBackendUrl(
    '/api/v1/{organizationId}/teams/{teamId}/sandbox/approval-requests/mine',
  ),
  ({ request }) => {
    const url = new URL(request.url);
    const page = Number.parseInt(url.searchParams.get('page') ?? '1', 10);
    const size = Number.parseInt(url.searchParams.get('size') ?? '20', 10);

    const mockApprovals = [
      {
        id: 1,
        deviceId: 1,
        userId: 'user-1',
        requestType: 'terminal',
        requestedConfig: {
          presetId: 2,
          presetName: 'Restricted Docker',
          sandboxTypeId: 2,
          category: 'container',
          networkPolicy: {
            mode: 'allow-list',
            allow: {
              external: [{ host: 'registry.npmjs.org', ports: [443] }],
              local: [],
            },
          },
          resourceLimits: {
            maxTimeoutMs: 120000,
            maxOutputSize: 4194304,
            pidsLimit: 200,
          },
          volumeMounts: null,
          providerConfig: null,
        },
        effectiveConfigAtRequest: {
          presetId: 1,
          presetName: 'Default Docker',
          sandboxTypeId: 2,
          category: 'container',
          networkPolicy: { mode: 'allow-all' },
          resourceLimits: {
            maxTimeoutMs: 30000,
            maxOutputSize: 1048576,
            pidsLimit: 100,
          },
          volumeMounts: null,
          providerConfig: null,
        },
        requestedPresetId: 2,
        effectivePresetId: 1,
        status: 'pending',
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
        reviewedBy: null,
        reviewedAt: null,
        createdAt: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: 2,
        deviceId: 2,
        userId: 'user-1',
        requestType: 'command',
        requestedConfig: {
          presetId: 3,
          presetName: 'No Sandbox',
          sandboxTypeId: 1,
          category: 'none',
          networkPolicy: null,
          resourceLimits: null,
          volumeMounts: null,
          providerConfig: null,
        },
        effectiveConfigAtRequest: {
          presetId: 1,
          presetName: 'Default Docker',
          sandboxTypeId: 2,
          category: 'container',
          networkPolicy: { mode: 'allow-all' },
          resourceLimits: {
            maxTimeoutMs: 30000,
            maxOutputSize: 1048576,
            pidsLimit: 100,
          },
          volumeMounts: null,
          providerConfig: null,
        },
        requestedPresetId: 3,
        effectivePresetId: 1,
        status: 'approved',
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
        reviewedBy: 'user-admin',
        reviewedAt: new Date(Date.now() - 1800000).toISOString(),
        createdAt: new Date(Date.now() - 7200000).toISOString(),
      },
    ];

    const totalResults = mockApprovals.length;
    const totalPages = Math.ceil(totalResults / size);
    const startIndex = (page - 1) * size;
    const endIndex = startIndex + size;
    const results = mockApprovals.slice(startIndex, endIndex);

    return HttpResponse.json({
      responseData: {
        results,
        hasNext: page < totalPages,
        hasPrevious: page > 1,
        totalResults,
        totalPages,
        page,
        size,
      },
      responseErrors: null,
    });
  },
);
