import type { CommandPaletteResult } from '@components/ds/molecules/command-palette.types';

export type RecentItem = CommandPaletteResult;

export interface RecentItemsStore {
  recentItems: RecentItem[];
  addRecentItem: (item: RecentItem) => void;
  clearRecent: () => void;
}
