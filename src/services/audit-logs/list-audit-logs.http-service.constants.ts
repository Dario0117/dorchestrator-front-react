import type { AuditLogsQueryParams } from '@services/audit-logs/list-audit-logs.http-service';

export type AuditLogAction = NonNullable<AuditLogsQueryParams['action']>;
export type AuditLogResourceType = NonNullable<
  AuditLogsQueryParams['resourceType']
>;

export const AUDIT_LOG_ACTIONS = [
  'created',
  'deleted',
  'updated',
] as const satisfies readonly AuditLogAction[];

export const AUDIT_LOG_RESOURCE_TYPES = [
  'device',
  'registration_token',
  'device_api_key',
  'organization',
  'member',
  'command',
] as const satisfies readonly AuditLogResourceType[];
