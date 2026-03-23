import { useSuspenseQuery } from '@tanstack/react-query';
import { $api } from '@/http-service-setup';
import type { operations } from '@/types/api.generated.types';

type GetRecordingOperation =
  operations['getApiV1ByOrganizationIdTerminalSessionsBySessionIdRecording'];

type GetRecordingResponse =
  GetRecordingOperation['responses']['200']['content']['application/json'];

type GetRecordingResult = GetRecordingResponse['responseData']['results'];

export type RecordingChunkItem = GetRecordingResult['chunks'][0];

export type RecordingData = GetRecordingResult;

export const useGetRecordingQueryOptions = (
  organizationId: string,
  sessionId: number,
  page = 1,
  size = 100,
) => {
  return $api.queryOptions(
    'get',
    '/api/v1/{organizationId}/terminal/sessions/{sessionId}/recording',
    {
      params: {
        path: { organizationId, sessionId },
        query: { page, size },
      },
    },
  );
};

export function useGetRecordingSuspenseQuery(
  organizationId: string,
  sessionId: number,
  page = 1,
  size = 100,
) {
  return useSuspenseQuery(
    useGetRecordingQueryOptions(organizationId, sessionId, page, size),
  );
}
