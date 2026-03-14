import type { TerminalSessionsQueryParams } from '@services/terminal/list-terminal-sessions.http-service';

export type TerminalSessionStatus = NonNullable<
  TerminalSessionsQueryParams['status']
>;

export const TERMINAL_SESSION_STATUSES = [
  'created',
  'active',
  'locked',
  'terminated',
] as const satisfies readonly TerminalSessionStatus[];
