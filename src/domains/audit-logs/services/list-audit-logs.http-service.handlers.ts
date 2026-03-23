import { buildBackendUrl } from '@lib/test-backend-url.utils';
import { HttpResponse, http } from 'msw';
import type { operations } from '@/types/api.generated.types';

type ListAuditLogsPathParams =
  operations['getApiV1ByOrganizationIdAudit-logs']['parameters']['path'];
type ListAuditLogsSuccessResponse =
  operations['getApiV1ByOrganizationIdAudit-logs']['responses']['200']['content']['application/json'];
type AuditLogEntry = NonNullable<
  ListAuditLogsSuccessResponse['responseData']
>['results'][0];

const mockAuditLogs: AuditLogEntry[] = [
  {
    id: 'al-1',
    organizationId: 'org-123',
    actorId: 'user-1',
    actorEmail: 'admin@org.com',
    action: 'created',
    resourceType: 'command',
    resourceId: 'cmd-1',
    metadata: {
      after: { command: 'echo test', status: 'pending' },
    },
    clientIp: '192.168.1.1',
    requestId: 'req-1',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'al-2',
    organizationId: 'org-123',
    actorId: 'user-1',
    actorEmail: 'admin@org.com',
    action: 'updated',
    resourceType: 'command',
    resourceId: 'cmd-1',
    metadata: {
      after: { newStatus: 'completed' },
    },
    clientIp: '192.168.1.1',
    requestId: 'req-2',
    createdAt: new Date(Date.now() - 3000000).toISOString(),
  },
  {
    id: 'al-3',
    organizationId: 'org-123',
    actorId: 'user-2',
    actorEmail: 'user@org.com',
    action: 'created',
    resourceType: 'device',
    resourceId: 'dev-1',
    metadata: {
      after: { deviceName: 'Server-01', platform: 'linux' },
    },
    clientIp: '10.0.0.1',
    requestId: 'req-3',
    createdAt: new Date(Date.now() - 2400000).toISOString(),
  },
  {
    id: 'al-4',
    organizationId: 'org-123',
    actorId: 'user-1',
    actorEmail: 'admin@org.com',
    action: 'deleted',
    resourceType: 'device',
    resourceId: 'dev-2',
    metadata: {
      before: { deviceId: 'dev-2' },
    },
    clientIp: '192.168.1.1',
    requestId: 'req-4',
    createdAt: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: 'al-5',
    organizationId: 'org-123',
    actorId: 'user-1',
    actorEmail: 'admin@org.com',
    action: 'created',
    resourceType: 'member',
    resourceId: 'member-1',
    metadata: {
      after: { userId: 'u-1', role: 'member' },
    },
    clientIp: '192.168.1.1',
    requestId: 'req-5',
    createdAt: new Date(Date.now() - 1200000).toISOString(),
  },
  {
    id: 'al-6',
    organizationId: 'org-123',
    actorId: null,
    actorEmail: null,
    action: 'created',
    resourceType: 'organization',
    resourceId: 'org-123',
    metadata: {
      after: { name: 'Acme Corp', slug: 'acme' },
    },
    clientIp: null,
    requestId: 'req-6',
    createdAt: new Date(Date.now() - 600000).toISOString(),
  },
  {
    id: 'al-7',
    organizationId: 'org-123',
    actorId: 'user-2',
    actorEmail: 'user@org.com',
    action: 'created',
    resourceType: 'registration_token',
    resourceId: 'rt-1',
    metadata: {
      after: { tokenName: 'deploy-token' },
    },
    clientIp: '10.0.0.1',
    requestId: 'req-7',
    createdAt: new Date(Date.now() - 300000).toISOString(),
  },
  {
    id: 'al-8',
    organizationId: 'org-123',
    actorId: 'user-1',
    actorEmail: 'admin@org.com',
    action: 'deleted',
    resourceType: 'device_api_key',
    resourceId: 'key-1',
    metadata: {
      before: { keyName: 'old-api-key' },
    },
    clientIp: '192.168.1.1',
    requestId: 'req-8',
    createdAt: new Date(Date.now() - 60000).toISOString(),
  },
];

export const listAuditLogsHandler = http.get<
  ListAuditLogsPathParams,
  never,
  ListAuditLogsSuccessResponse
>(buildBackendUrl('/api/v1/{organizationId}/audit-logs'), ({ request }) => {
  const url = new URL(request.url);
  const page = Number.parseInt(url.searchParams.get('page') ?? '1', 10);
  const size = Number.parseInt(url.searchParams.get('size') ?? '25', 10);
  const action = url.searchParams.get('action');
  const resourceType = url.searchParams.get('resourceType');
  const fromDate = url.searchParams.get('fromDate');
  const toDate = url.searchParams.get('toDate');

  let filtered = [...mockAuditLogs];

  if (action) {
    filtered = filtered.filter((entry) => entry.action === action);
  }
  if (resourceType) {
    filtered = filtered.filter((entry) => entry.resourceType === resourceType);
  }
  if (fromDate) {
    filtered = filtered.filter((entry) => entry.createdAt >= fromDate);
  }
  if (toDate) {
    filtered = filtered.filter((entry) => entry.createdAt <= toDate);
  }

  const totalResults = filtered.length;
  const totalPages = Math.ceil(totalResults / size);
  const startIndex = (page - 1) * size;
  const endIndex = startIndex + size;
  const results = filtered.slice(startIndex, endIndex);

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
});
