import { formatRelativeTime } from '@lib/format-relative-time';

describe('formatRelativeTime', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-02-17T12:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should format seconds ago for times less than 1 minute', () => {
    const thirtySecondsAgo = new Date('2026-02-17T11:59:30.000Z');
    const result = formatRelativeTime(thirtySecondsAgo, 'en');
    expect(result).toBe('30 seconds ago');
  });

  it('should format minutes ago for times less than 1 hour', () => {
    const fiveMinutesAgo = new Date('2026-02-17T11:55:00.000Z');
    const result = formatRelativeTime(fiveMinutesAgo, 'en');
    expect(result).toBe('5 minutes ago');
  });

  it('should format hours ago for times less than 24 hours', () => {
    const threeHoursAgo = new Date('2026-02-17T09:00:00.000Z');
    const result = formatRelativeTime(threeHoursAgo, 'en');
    expect(result).toBe('3 hours ago');
  });

  it('should format absolute date for times >= 24 hours', () => {
    const twoDaysAgo = new Date('2026-02-15T12:00:00.000Z');
    const result = formatRelativeTime(twoDaysAgo, 'en');
    expect(result).toMatch(/Feb 15/);
  });

  it('should accept string dates', () => {
    const result = formatRelativeTime('2026-02-17T11:55:00.000Z', 'en');
    expect(result).toBe('5 minutes ago');
  });

  it('should accept Date objects', () => {
    const result = formatRelativeTime(
      new Date('2026-02-17T11:55:00.000Z'),
      'en',
    );
    expect(result).toBe('5 minutes ago');
  });

  it('should clamp future dates to zero difference', () => {
    const futureDate = new Date('2026-02-17T12:05:00.000Z');
    const result = formatRelativeTime(futureDate, 'en');
    expect(result).toMatch(/0 seconds ago|now/);
  });

  it('should format at exact 1-minute boundary as minutes', () => {
    const exactlyOneMinuteAgo = new Date('2026-02-17T11:59:00.000Z');
    const result = formatRelativeTime(exactlyOneMinuteAgo, 'en');
    expect(result).toBe('1 minute ago');
  });

  it('should format at exact 1-hour boundary as hours', () => {
    const exactlyOneHourAgo = new Date('2026-02-17T11:00:00.000Z');
    const result = formatRelativeTime(exactlyOneHourAgo, 'en');
    expect(result).toBe('1 hour ago');
  });

  it('should format at exact 24-hour boundary as absolute date', () => {
    const exactlyOneDayAgo = new Date('2026-02-16T12:00:00.000Z');
    const result = formatRelativeTime(exactlyOneDayAgo, 'en');
    expect(result).toMatch(/Feb 16/);
  });
});
