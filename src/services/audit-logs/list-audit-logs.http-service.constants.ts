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
  'session',
  'user_account',
  'auth_failure',
] as const satisfies readonly AuditLogResourceType[];

export const AUDIT_LOG_RESOURCE_TYPE_LABELS = {
  device: 'Device',
  command: 'Command',
  organization: 'Organization',
  member: 'Member',
  registration_token: 'Registration Token',
  device_api_key: 'API Key',
  session: 'Session',
  user_account: 'User Account',
  auth_failure: 'Auth Failure',
} as const satisfies Record<AuditLogResourceType, string>;
