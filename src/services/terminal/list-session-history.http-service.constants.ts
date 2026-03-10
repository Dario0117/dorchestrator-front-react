import type { SessionHistoryQueryParams } from '@services/terminal/list-session-history.http-service';

export type SessionHistoryStatus = NonNullable<
  SessionHistoryQueryParams['status']
>;

export const SESSION_HISTORY_STATUSES = [
  'created',
  'active',
  'locked',
  'terminated',
] as const satisfies readonly SessionHistoryStatus[];
