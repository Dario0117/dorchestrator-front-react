import { buildBackendUrl } from '@lib/test.utils';
import { HttpResponse, http } from 'msw';
import type { operations } from '@/types/api.generated.types';

type GetCommandSuccessResponse =
  operations['getApiV1ByOrganizationIdCommandsByCommandId']['responses']['200']['content']['application/json'];

export const getCommandHandler = http.get<
  { organizationId: string; commandId: string },
  never,
  GetCommandSuccessResponse
>(
  buildBackendUrl('/api/v1/{organizationId}/commands/{commandId}'),
  ({ params }) =>
    HttpResponse.json({
      responseData: {
        results: {
          id: Number(params.commandId),
          command: 'echo "hello world"',
          status: 'completed',
          deviceName: 'Test Server',
          submittedBy: 'test@example.com',
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          startedAt: new Date(Date.now() - 3500000).toISOString(),
          completedAt: new Date(Date.now() - 3400000).toISOString(),
          results: [
            {
              id: 1,
              stdout: 'hello world\n',
              stderr: null,
              exitCode: 0,
              createdAt: new Date(Date.now() - 3400000).toISOString(),
            },
          ],
        },
      },
      responseErrors: null,
    }),
);
