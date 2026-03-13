import { useTerminalShare } from '@components/terminal/hooks/use-terminal-share';
import { buildBackendUrl } from '@lib/test.utils';
import { createQueryThemeWrapper } from '@lib/test-wrappers.utils';
import { act, renderHook, waitFor } from '@testing-library/react';
import { HttpResponse, http } from 'msw';
import { server } from '@/../testsSetup';

const DEFAULT_PROPS = {
  organizationId: 'org-1',
  organizationSlug: 'my-org',
  sessionId: 42,
  initialIsShared: false,
  initialShareToken: null as string | null,
};

describe('useTerminalShare', () => {
  const writeTextMock = vi.fn<(data: string) => Promise<void>>();

  beforeEach(() => {
    writeTextMock.mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: writeTextMock },
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    writeTextMock.mockReset();
  });

  it('starts with isShared matching initialIsShared (false)', () => {
    const { result } = renderHook(() => useTerminalShare(DEFAULT_PROPS), {
      wrapper: createQueryThemeWrapper(),
    });

    expect(result.current.isShared).toBe(false);
    expect(result.current.shareUrl).toBeNull();
    expect(result.current.isSharePending).toBe(false);
  });

  it('starts with isShared true when initialIsShared is true', () => {
    const { result } = renderHook(
      () =>
        useTerminalShare({
          ...DEFAULT_PROPS,
          initialIsShared: true,
          initialShareToken: 'existing-token',
        }),
      { wrapper: createQueryThemeWrapper() },
    );

    expect(result.current.isShared).toBe(true);
  });

  it('constructs shareUrl from initialShareToken when provided', () => {
    const { result } = renderHook(
      () =>
        useTerminalShare({
          ...DEFAULT_PROPS,
          initialIsShared: true,
          initialShareToken: 'existing-token',
        }),
      { wrapper: createQueryThemeWrapper() },
    );

    expect(result.current.shareUrl).toBe(
      `${window.location.origin}/my-org/terminal/shared/existing-token`,
    );
  });

  it('has null shareUrl when no initialShareToken', () => {
    const { result } = renderHook(() => useTerminalShare(DEFAULT_PROPS), {
      wrapper: createQueryThemeWrapper(),
    });

    expect(result.current.shareUrl).toBeNull();
  });

  it('shares and sets shareUrl on handleToggleShare when not shared', async () => {
    const { result } = renderHook(() => useTerminalShare(DEFAULT_PROPS), {
      wrapper: createQueryThemeWrapper(),
    });

    act(() => {
      result.current.handleToggleShare();
    });

    await waitFor(() => {
      expect(result.current.isShared).toBe(true);
    });

    expect(result.current.shareUrl).toBe(
      `${window.location.origin}/my-org/terminal/shared/mock-share-token`,
    );
    // Should also auto-copy
    expect(writeTextMock).toHaveBeenCalledWith(
      `${window.location.origin}/my-org/terminal/shared/mock-share-token`,
    );
  });

  it('unshares and clears shareUrl on handleToggleShare when shared', async () => {
    const { result } = renderHook(
      () =>
        useTerminalShare({
          ...DEFAULT_PROPS,
          initialIsShared: true,
          initialShareToken: 'existing-token',
        }),
      { wrapper: createQueryThemeWrapper() },
    );

    expect(result.current.isShared).toBe(true);

    act(() => {
      result.current.handleToggleShare();
    });

    await waitFor(() => {
      expect(result.current.isShared).toBe(false);
    });

    expect(result.current.shareUrl).toBeNull();
  });

  it('copies the share URL with copyShareUrl', async () => {
    const { result } = renderHook(
      () =>
        useTerminalShare({
          ...DEFAULT_PROPS,
          initialIsShared: true,
          initialShareToken: 'existing-token',
        }),
      { wrapper: createQueryThemeWrapper() },
    );

    const expectedUrl = `${window.location.origin}/my-org/terminal/shared/existing-token`;

    act(() => {
      result.current.copyShareUrl();
    });

    await waitFor(() => {
      expect(writeTextMock).toHaveBeenCalledWith(expectedUrl);
    });
  });

  it('does not set shareUrl when share response has no shareToken', async () => {
    server.use(
      http.post(
        buildBackendUrl(
          '/api/v1/{organizationId}/terminal/sessions/{sessionId}/share',
        ),
        () => {
          return HttpResponse.json({
            responseData: {
              results: {
                sessionId: 1,
                shareToken: null,
                isShared: true,
              },
            },
            responseErrors: null,
          });
        },
      ),
    );

    const { result } = renderHook(() => useTerminalShare(DEFAULT_PROPS), {
      wrapper: createQueryThemeWrapper(),
    });

    act(() => {
      result.current.handleToggleShare();
    });

    await waitFor(() => {
      expect(result.current.isShared).toBe(true);
    });

    expect(result.current.shareUrl).toBeNull();
    expect(writeTextMock).not.toHaveBeenCalled();
  });

  it('does not copy when shareUrl is null', () => {
    const { result } = renderHook(() => useTerminalShare(DEFAULT_PROPS), {
      wrapper: createQueryThemeWrapper(),
    });

    act(() => {
      result.current.copyShareUrl();
    });

    expect(writeTextMock).not.toHaveBeenCalled();
  });
});
