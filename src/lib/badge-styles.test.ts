import { badgeStyles } from '@lib/badge-styles';

describe('badgeStyles', () => {
  const expectedKeys = ['green', 'blue', 'yellow', 'amber', 'red', 'gray'];

  it('should contain all expected color keys', () => {
    for (const key of expectedKeys) {
      expect(badgeStyles).toHaveProperty(key);
    }
  });

  it('should have exactly 6 entries', () => {
    expect(Object.keys(badgeStyles)).toHaveLength(6);
  });

  it('should have non-empty string values for all keys', () => {
    for (const key of Object.keys(badgeStyles)) {
      const value = badgeStyles[key as keyof typeof badgeStyles];
      expect(typeof value).toBe('string');
      expect(value.length).toBeGreaterThan(0);
    }
  });
});
