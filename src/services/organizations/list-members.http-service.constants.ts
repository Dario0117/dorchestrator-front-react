import type { MembersQueryParams } from '@services/organizations/list-members.http-service';

export type MemberRole = NonNullable<MembersQueryParams['role']>;

export const MEMBER_ROLES = [
  'member',
  'admin',
  'owner',
] as const satisfies readonly MemberRole[];
