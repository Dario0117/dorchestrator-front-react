import type { CommandsQueryParams } from '@domains/commands/services/list-commands.http-service';

export type CommandStatus = NonNullable<CommandsQueryParams['status']>;

export const COMMAND_STATUSES = [
  'pending',
  'running',
  'completed',
  'failed',
] as const satisfies readonly CommandStatus[];
