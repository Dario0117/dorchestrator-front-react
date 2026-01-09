import type { useUserOrganizationsQueryReturnType } from '@services/organizations/list-user-organizations.http-service';

export type OrganizationItem = NonNullable<
  useUserOrganizationsQueryReturnType['data']
>[0];

export interface OrganizationState {
  organizations: OrganizationItem[];
  currentOrganization: OrganizationItem;
}

export interface OrganizationActions {
  setOrganizations: (organizations: OrganizationItem[]) => void;
  setCurrentOrganization: (organization: OrganizationItem) => void;
}
