import { formatExpirationDate } from '@lib/format-expiration';

const NOW = new Date('2025-06-01T12:00:00Z');

describe('formatExpirationDate', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('formats a future date with days, hours, and minutes remaining', () => {
    const future = new Date(
      NOW.getTime() + 2 * 86_400_000 + 3 * 3_600_000 + 15 * 60_000,
    );
    const result = formatExpirationDate(future.toISOString(), 'en-US');
    expect(result).toContain('(2d 3h 15m)');
  });

  it('formats a future date with only hours and minutes remaining', () => {
    const future = new Date(NOW.getTime() + 5 * 3_600_000 + 30 * 60_000);
    const result = formatExpirationDate(future.toISOString(), 'en-US');
    expect(result).toContain('(5h 30m)');
  });

  it('formats a future date with only minutes remaining', () => {
    const future = new Date(NOW.getTime() + 45 * 60_000);
    const result = formatExpirationDate(future.toISOString(), 'en-US');
    expect(result).toContain('(45m)');
  });

  it('shows 0m when the date is in the past', () => {
    const past = new Date(NOW.getTime() - 60_000);
    const result = formatExpirationDate(past.toISOString(), 'en-US');
    expect(result).toContain('(0m)');
  });

  it('shows 0m when the date is exactly now', () => {
    const result = formatExpirationDate('2025-06-01T12:00:00Z', 'en-US');
    expect(result).toContain('(0m)');
  });

  it('shows days and hours but omits minutes when minutes is 0', () => {
    const future = new Date(NOW.getTime() + 1 * 86_400_000 + 2 * 3_600_000);
    const result = formatExpirationDate(future.toISOString(), 'en-US');
    expect(result).toContain('(1d 2h)');
    expect(result).not.toMatch(/\d+m/);
  });

  it('shows days only when hours and minutes are 0', () => {
    const future = new Date(NOW.getTime() + 3 * 86_400_000);
    const result = formatExpirationDate(future.toISOString(), 'en-US');
    expect(result).toContain('(3d)');
  });

  it('shows hours only when days is 0 and minutes is 0', () => {
    const future = new Date(NOW.getTime() + 2 * 3_600_000);
    const result = formatExpirationDate(future.toISOString(), 'en-US');
    expect(result).toContain('(2h)');
    expect(result).not.toMatch(/\d+m/);
  });
});
