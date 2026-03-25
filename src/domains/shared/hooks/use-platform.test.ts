describe('usePlatform', () => {
  afterEach(() => {
    vi.resetModules();
  });

  it('returns modLabel Ctrl for non-Mac environments', async () => {
    const { usePlatform } = await import('@domains/shared/hooks/use-platform');
    const { modLabel, isMac } = usePlatform();
    expect(isMac).toBe(false);
    expect(modLabel).toBe('Ctrl');
  });

  it('returns modLabel ⌘ for Mac environments', async () => {
    const originalPlatform = navigator.platform;
    Object.defineProperty(navigator, 'platform', {
      value: 'MacIntel',
      writable: true,
      configurable: true,
    });

    const { usePlatform } = await import('@domains/shared/hooks/use-platform');
    const { modLabel, isMac } = usePlatform();
    expect(isMac).toBe(true);
    expect(modLabel).toBe('⌘');

    Object.defineProperty(navigator, 'platform', {
      value: originalPlatform,
      writable: true,
      configurable: true,
    });
  });
});
