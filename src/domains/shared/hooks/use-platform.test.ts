import { usePlatform } from '@domains/shared/hooks/use-platform';

describe('usePlatform', () => {
  it('returns modLabel Ctrl for non-Mac environments', () => {
    // jsdom defaults to non-Mac (empty navigator.platform)
    const { modLabel, isMac } = usePlatform();
    expect(isMac).toBe(false);
    expect(modLabel).toBe('Ctrl');
  });
});
