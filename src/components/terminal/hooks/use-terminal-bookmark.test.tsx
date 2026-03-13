import { useTerminalBookmark } from '@components/terminal/hooks/use-terminal-bookmark';
import { createQueryThemeWrapper } from '@lib/test-wrappers.utils';
import { act, renderHook, waitFor } from '@testing-library/react';

const DEFAULT_PROPS = {
  organizationId: 'org-1',
  sessionId: 42,
};

describe('useTerminalBookmark', () => {
  it('starts with bookmarkId null and isBookmarkPending false', () => {
    const { result } = renderHook(() => useTerminalBookmark(DEFAULT_PROPS), {
      wrapper: createQueryThemeWrapper(),
    });

    expect(result.current.bookmarkId).toBeNull();
    expect(result.current.isBookmarkPending).toBe(false);
  });

  it('creates a bookmark when handleToggleBookmark is called with no bookmarkId', async () => {
    const { result } = renderHook(() => useTerminalBookmark(DEFAULT_PROPS), {
      wrapper: createQueryThemeWrapper(),
    });

    act(() => {
      result.current.handleToggleBookmark();
    });

    await waitFor(() => {
      expect(result.current.bookmarkId).toBe(99);
    });

    expect(result.current.isBookmarkPending).toBe(false);
  });

  it('deletes a bookmark when handleToggleBookmark is called with an existing bookmarkId', async () => {
    const { result } = renderHook(() => useTerminalBookmark(DEFAULT_PROPS), {
      wrapper: createQueryThemeWrapper(),
    });

    // First, create a bookmark
    act(() => {
      result.current.handleToggleBookmark();
    });

    await waitFor(() => {
      expect(result.current.bookmarkId).toBe(99);
    });

    // Now toggle again to delete
    act(() => {
      result.current.handleToggleBookmark();
    });

    await waitFor(() => {
      expect(result.current.bookmarkId).toBeNull();
    });

    expect(result.current.isBookmarkPending).toBe(false);
  });
});
