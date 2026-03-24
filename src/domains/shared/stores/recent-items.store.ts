import type {
  RecentItem,
  RecentItemsStore,
} from '@domains/shared/stores/recent-items.store.types';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const MAX_RECENT_ITEMS = 5;

export const useRecentItemsStore = create<RecentItemsStore>()(
  persist(
    (set) => ({
      recentItems: [],

      addRecentItem: (item: RecentItem) =>
        set((state) => {
          const filtered = state.recentItems.filter((i) => i.id !== item.id);
          return {
            recentItems: [item, ...filtered].slice(0, MAX_RECENT_ITEMS),
          };
        }),

      clearRecent: () => set({ recentItems: [] }),
    }),
    {
      name: 'dorchestrator-recent-items',
    },
  ),
);
