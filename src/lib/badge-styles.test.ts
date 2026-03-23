import { badgeStyles } from '@lib/badge-styles';

describe('badgeStyles', () => {
  const expectedKeys = ['success', 'info', 'warning', 'error', 'neutral'];

  it('should contain all expected semantic color keys', () => {
    for (const key of expectedKeys) {
      expect(badgeStyles).toHaveProperty(key);
    }
  });

  it('should have exactly 5 semantic entries', () => {
    expect(Object.keys(badgeStyles)).toHaveLength(5);
  });

  it('should have non-empty string values for all keys', () => {
    for (const key of Object.keys(badgeStyles)) {
      const value = badgeStyles[key as keyof typeof badgeStyles];
      expect(typeof value).toBe('string');
      expect(value.length).toBeGreaterThan(0);
    }
  });
});
