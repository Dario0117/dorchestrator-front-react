import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { $api } from '@/http-service-setup';

export const useTerminalSessionQueryOptions = (
  organizationId: string,
  sessionId: number,
) =>
  $api.queryOptions(
    'get',
    '/api/v1/{organizationId}/terminal/sessions/{sessionId}',
    {
      params: {
        path: {
          organizationId,
          sessionId,
        },
      },
    },
  );

function useTerminalSessionQuery(organizationId: string, sessionId: number) {
  return useQuery(useTerminalSessionQueryOptions(organizationId, sessionId));
}

export function useTerminalSessionSuspenseQuery(
  organizationId: string,
  sessionId: number,
) {
  return useSuspenseQuery(
    useTerminalSessionQueryOptions(organizationId, sessionId),
  );
}

type useTerminalSessionQueryReturnType = ReturnType<
  typeof useTerminalSessionQuery
>;
type useTerminalSessionQueryData = useTerminalSessionQueryReturnType['data'];
export type useTerminalSessionQueryResponseData = NonNullable<
  NonNullable<useTerminalSessionQueryData>['responseData']
>;
export type TerminalSessionDetail =
  NonNullable<useTerminalSessionQueryResponseData>['results'];
