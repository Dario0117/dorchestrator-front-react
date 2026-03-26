import type { NavigationStore } from '@domains/shared/stores/navigation.store.types';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useNavigationStore = create<NavigationStore>()(
  persist(
    (set) => ({
      activeOrgSlug: null,
      teamByOrg: {},

      setActiveOrg: (orgSlug: string) => set({ activeOrgSlug: orgSlug }),

      setActiveTeam: (orgSlug: string, teamSlug: string) =>
        set((state) => ({
          teamByOrg: { ...state.teamByOrg, [orgSlug]: teamSlug },
        })),

      clear: () => set({ activeOrgSlug: null, teamByOrg: {} }),
    }),
    {
      name: 'dorchestrator-navigation',
    },
  ),
);
