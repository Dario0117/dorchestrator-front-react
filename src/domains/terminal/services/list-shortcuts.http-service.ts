import { useSuspenseQuery } from '@tanstack/react-query';
import { $api } from '@/http-service-setup';
import type { operations } from '@/types/api.generated.types';

type ListShortcutsOperation =
  operations['getApiV1ByOrganizationIdTerminalShortcuts'];

type ListShortcutsResponse =
  ListShortcutsOperation['responses']['200']['content']['application/json'];

type ShortcutItem = ListShortcutsResponse['responseData']['results'][0];

export type { ShortcutItem };

export const useShortcutsQueryOptions = (organizationId: string) => {
  return $api.queryOptions(
    'get',
    '/api/v1/{organizationId}/terminal/shortcuts',
    {
      params: {
        query: { page: 1, size: 100 },
        path: { organizationId },
      },
    },
  );
};

export function useShortcutsSuspenseQuery(organizationId: string) {
  return useSuspenseQuery(useShortcutsQueryOptions(organizationId));
}
