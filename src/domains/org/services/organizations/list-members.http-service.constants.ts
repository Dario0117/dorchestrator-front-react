import type { MembersQueryParams } from '@domains/org/services/organizations/list-members.http-service';

export type MemberRole = NonNullable<MembersQueryParams['role']>;

export const MEMBER_ROLES = [
  'member',
  'admin',
  'owner',
] as const satisfies readonly MemberRole[];
