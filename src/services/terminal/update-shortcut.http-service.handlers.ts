import { buildBackendUrl } from '@lib/test.utils';
import { HttpResponse, http } from 'msw';
import type { operations } from '@/types/api.generated.types';

type UpdateShortcutResponse =
  operations['patchApiV1ByOrganizationIdTerminalShortcutsByShortcutId']['responses']['200']['content']['application/json'];

type UpdateShortcutBody =
  operations['patchApiV1ByOrganizationIdTerminalShortcutsByShortcutId']['requestBody']['content']['application/json'];

// MSW path params are always strings
type UpdateShortcutMswPathParams = {
  organizationId: string;
  shortcutId: string;
};

export const updateShortcutHandler = http.patch<
  UpdateShortcutMswPathParams,
  UpdateShortcutBody,
  UpdateShortcutResponse
>(
  buildBackendUrl('/api/v1/{organizationId}/terminal/shortcuts/{shortcutId}'),
  async ({ request, params }) => {
    const body = await request.json();

    return HttpResponse.json({
      responseData: {
        results: {
          id: Number(params.shortcutId),
          label: body.label ?? 'Existing Label',
          keySequence: body.keySequence ?? 'existing\n',
          mode: body.mode ?? 'keystroke',
          color: body.color ?? null,
          icon: body.icon ?? null,
          sortOrder: body.sortOrder ?? 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      },
      responseErrors: null,
    });
  },
);
