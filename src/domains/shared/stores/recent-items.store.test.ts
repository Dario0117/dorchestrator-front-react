import { useRecentItemsStore } from '@domains/shared/stores/recent-items.store';
import type { RecentItem } from '@domains/shared/stores/recent-items.store.types';
import { act } from '@testing-library/react';

const makeItem = (id: string, label = `Item ${id}`): RecentItem => ({
  id,
  type: 'device',
  label,
});

describe('useRecentItemsStore', () => {
  beforeEach(() => {
    act(() => {
      useRecentItemsStore.getState().clearRecent();
    });
  });

  it('starts with an empty list', () => {
    expect(useRecentItemsStore.getState().recentItems).toEqual([]);
  });

  it('adds an item to the front of the list', () => {
    act(() => {
      useRecentItemsStore.getState().addRecentItem(makeItem('1'));
    });
    expect(useRecentItemsStore.getState().recentItems).toHaveLength(1);
    expect(useRecentItemsStore.getState().recentItems[0]?.id).toBe('1');
  });

  it('deduplicates by moving existing item to front', () => {
    act(() => {
      useRecentItemsStore.getState().addRecentItem(makeItem('1'));
      useRecentItemsStore.getState().addRecentItem(makeItem('2'));
      useRecentItemsStore.getState().addRecentItem(makeItem('1'));
    });
    const items = useRecentItemsStore.getState().recentItems;
    expect(items).toHaveLength(2);
    expect(items[0]?.id).toBe('1');
    expect(items[1]?.id).toBe('2');
  });

  it('limits to 5 items', () => {
    act(() => {
      for (let i = 1; i <= 7; i++) {
        useRecentItemsStore.getState().addRecentItem(makeItem(String(i)));
      }
    });
    expect(useRecentItemsStore.getState().recentItems).toHaveLength(5);
    expect(useRecentItemsStore.getState().recentItems[0]?.id).toBe('7');
  });

  it('clears all items', () => {
    act(() => {
      useRecentItemsStore.getState().addRecentItem(makeItem('1'));
      useRecentItemsStore.getState().clearRecent();
    });
    expect(useRecentItemsStore.getState().recentItems).toEqual([]);
  });
});
