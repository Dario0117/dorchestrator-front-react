import {
  formatDurationBetween,
  formatDurationCompact,
  formatDurationHuman,
} from '@lib/format-duration';

describe('formatDurationCompact', () => {
  it('should format milliseconds', () => {
    expect(formatDurationCompact(500)).toBe('500ms');
    expect(formatDurationCompact(0)).toBe('0ms');
    expect(formatDurationCompact(999)).toBe('999ms');
  });

  it('should format seconds', () => {
    expect(formatDurationCompact(1000)).toBe('1s');
    expect(formatDurationCompact(45000)).toBe('45s');
    expect(formatDurationCompact(59000)).toBe('59s');
  });

  it('should format minutes and seconds', () => {
    expect(formatDurationCompact(60000)).toBe('1m 0s');
    expect(formatDurationCompact(90000)).toBe('1m 30s');
    expect(formatDurationCompact(155000)).toBe('2m 35s');
  });

  it('should format hours and minutes', () => {
    expect(formatDurationCompact(3600000)).toBe('1h 0m');
    expect(formatDurationCompact(5400000)).toBe('1h 30m');
    expect(formatDurationCompact(8100000)).toBe('2h 15m');
  });
});

describe('formatDurationHuman', () => {
  it('should format minutes', () => {
    expect(formatDurationHuman(60000)).toBe('1 minute');
    expect(formatDurationHuman(120000)).toBe('2 minutes');
    expect(formatDurationHuman(1800000)).toBe('30 minutes');
  });

  it('should format exact hours', () => {
    expect(formatDurationHuman(3600000)).toBe('1 hour');
    expect(formatDurationHuman(7200000)).toBe('2 hours');
  });

  it('should format hours and remaining minutes', () => {
    expect(formatDurationHuman(5400000)).toBe('1h 30m');
    expect(formatDurationHuman(8100000)).toBe('2h 15m');
  });

  it('should handle singular minute', () => {
    expect(formatDurationHuman(60000)).toBe('1 minute');
  });
});

describe('formatDurationBetween', () => {
  it('should return formatted duration between timestamps', () => {
    expect(
      formatDurationBetween(
        '2025-12-28T10:00:00.000Z',
        '2025-12-28T10:00:30.000Z',
      ),
    ).toBe('30s');
  });

  it('should return null when startedAt is null', () => {
    expect(formatDurationBetween(null, '2025-12-28T10:00:30.000Z')).toBeNull();
  });

  it('should return null when completedAt is null', () => {
    expect(formatDurationBetween('2025-12-28T10:00:00.000Z', null)).toBeNull();
  });

  it('should return null when both are null', () => {
    expect(formatDurationBetween(null, null)).toBeNull();
  });
});
