import { buildBackendUrl } from '@lib/test-backend-url.utils';
import { HttpResponse, http } from 'msw';
import type { operations } from '@/types/api.generated.types';

type ListShortcutsResponse =
  operations['getApiV1ByOrganizationIdTerminalShortcuts']['responses']['200']['content']['application/json'];

type ListShortcutsPathParams =
  operations['getApiV1ByOrganizationIdTerminalShortcuts']['parameters']['path'];

export const listShortcutsHandler = http.get<
  ListShortcutsPathParams,
  never,
  ListShortcutsResponse
>(buildBackendUrl('/api/v1/{organizationId}/terminal/shortcuts'), () => {
  return HttpResponse.json({
    responseData: {
      results: [
        {
          id: 1,
          label: 'ls -la',
          keySequence: 'ls -la\n',
          mode: 'keystroke',
          color: null,
          icon: null,
          sortOrder: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 2,
          label: 'git status',
          keySequence: 'git status\n',
          mode: 'snippet',
          color: '#22c55e',
          icon: null,
          sortOrder: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      hasNext: false,
      hasPrevious: false,
      totalResults: 2,
      totalPages: 1,
      page: 1,
      size: 100,
    },
    responseErrors: null,
  });
});
