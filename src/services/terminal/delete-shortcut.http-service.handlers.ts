import { buildBackendUrl } from '@lib/test.utils';
import { HttpResponse, http } from 'msw';
import type { operations } from '@/types/api.generated.types';

type DeleteShortcutResponse =
  operations['deleteApiV1ByOrganizationIdTerminalShortcutsByShortcutId']['responses']['200']['content']['application/json'];

// MSW path params are always strings
type DeleteShortcutMswPathParams = {
  organizationId: string;
  shortcutId: string;
};

export const deleteShortcutHandler = http.delete<
  DeleteShortcutMswPathParams,
  never,
  DeleteShortcutResponse
>(
  buildBackendUrl('/api/v1/{organizationId}/terminal/shortcuts/{shortcutId}'),
  () => {
    return HttpResponse.json({
      responseData: {
        results: ['Shortcut deleted successfully'],
      },
      responseErrors: null,
    });
  },
);
