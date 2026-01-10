import { DEFAULT_ORGANIZATION_ID } from '@stores/organization.store.constants';
import type {
  OrganizationActions,
  OrganizationState,
} from '@stores/organization.store.types';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

export const useOrganizationStore = create<
  OrganizationState & OrganizationActions
>()(
  immer((set, _get) => ({
    organizations: [],
    currentOrganization: {
      id: DEFAULT_ORGANIZATION_ID,
      name: 'Dorchestrator',
      slug: 'dorchestrator',
      createdAt: new Date(),
    },

    setOrganizations: (organizations) => {
      set((state) => {
        state.organizations = organizations;
        const firstOrg = organizations[0];
        if (
          state.currentOrganization.id === DEFAULT_ORGANIZATION_ID &&
          firstOrg
        ) {
          state.currentOrganization = firstOrg;
        }
      });
    },

    setCurrentOrganization: (organization) => {
      set((state) => {
        state.currentOrganization = organization;
      });
    },
  })),
);
