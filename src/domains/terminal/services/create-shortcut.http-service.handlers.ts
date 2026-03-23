import { buildBackendUrl } from '@lib/test-backend-url.utils';
import { HttpResponse, http } from 'msw';
import type { operations } from '@/types/api.generated.types';

type CreateShortcutResponse =
  operations['postApiV1ByOrganizationIdTerminalShortcuts']['responses']['201']['content']['application/json'];

type CreateShortcutPathParams =
  operations['postApiV1ByOrganizationIdTerminalShortcuts']['parameters']['path'];

type CreateShortcutBody =
  operations['postApiV1ByOrganizationIdTerminalShortcuts']['requestBody']['content']['application/json'];

let nextId = 100;

export const createShortcutHandler = http.post<
  CreateShortcutPathParams,
  CreateShortcutBody,
  CreateShortcutResponse
>(
  buildBackendUrl('/api/v1/{organizationId}/terminal/shortcuts'),
  async ({ request }) => {
    const body = await request.json();
    const id = nextId++;

    return HttpResponse.json(
      {
        responseData: {
          results: {
            id,
            label: body.label,
            keySequence: body.keySequence,
            mode: body.mode ?? 'keystroke',
            color: body.color ?? null,
            icon: body.icon ?? null,
            sortOrder: body.sortOrder ?? 0,
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
