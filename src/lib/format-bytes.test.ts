import { formatBytes } from '@lib/format-bytes';

describe('formatBytes', () => {
  it('should return "—" for null', () => {
    expect(formatBytes(null)).toBe('—');
  });

  it('should return "—" for 0', () => {
    expect(formatBytes(0)).toBe('—');
  });

  it('should format bytes (< 1 KB)', () => {
    expect(formatBytes(500)).toBe('500 B');
  });

  it('should format kilobytes', () => {
    expect(formatBytes(1024)).toBe('1.0 KB');
    expect(formatBytes(1536)).toBe('1.5 KB');
  });

  it('should format megabytes', () => {
    expect(formatBytes(1048576)).toBe('1.0 MB');
    expect(formatBytes(5242880)).toBe('5.0 MB');
  });

  it('should format gigabytes', () => {
    expect(formatBytes(1073741824)).toBe('1.0 GB');
    expect(formatBytes(2684354560)).toBe('2.5 GB');
  });

  it('should format 1 byte', () => {
    expect(formatBytes(1)).toBe('1 B');
  });
});
