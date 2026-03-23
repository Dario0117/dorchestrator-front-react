import type { RecordingEvent } from '@domains/terminal/components/recording-player.types';
import {
  collectFileEventsUpTo,
  formatTimestamp,
  tryParseFileEvent,
} from '@domains/terminal/components/recording-player.utils';

describe('formatTimestamp', () => {
  it('should format ISO string to readable datetime', () => {
    expect(formatTimestamp('2026-03-12T14:30:45.123Z')).toBe(
      '2026-03-12 14:30:45',
    );
  });

  it('should handle midnight timestamp', () => {
    expect(formatTimestamp('2026-01-01T00:00:00.000Z')).toBe(
      '2026-01-01 00:00:00',
    );
  });
});

describe('tryParseFileEvent', () => {
  it('should parse valid file event JSON', () => {
    const data = JSON.stringify({
      filename: 'test.txt',
      mimeType: 'text/plain',
      sizeBytes: 1024,
      writtenPath: '/tmp/test.txt',
      transferId: 'abc-123',
    });

    const result = tryParseFileEvent(data);

    expect(result).toEqual({
      filename: 'test.txt',
      mimeType: 'text/plain',
      sizeBytes: 1024,
      writtenPath: '/tmp/test.txt',
      transferId: 'abc-123',
    });
  });

  it('should return null for JSON without filename', () => {
    const data = JSON.stringify({ mimeType: 'text/plain' });
    expect(tryParseFileEvent(data)).toBeNull();
  });

  it('should return null for JSON without mimeType', () => {
    const data = JSON.stringify({ filename: 'test.txt' });
    expect(tryParseFileEvent(data)).toBeNull();
  });

  it('should return null for invalid JSON', () => {
    expect(tryParseFileEvent('not-json')).toBeNull();
  });

  it('should return null for empty string', () => {
    expect(tryParseFileEvent('')).toBeNull();
  });
});

describe('collectFileEventsUpTo', () => {
  const fileEventData = JSON.stringify({
    filename: 'test.txt',
    mimeType: 'text/plain',
    sizeBytes: 512,
    writtenPath: '/tmp/test.txt',
    transferId: 'transfer-1',
  });

  const events: RecordingEvent[] = [
    { type: 'output', data: 'hello', timestamp: '2026-01-01T00:00:00Z' },
    { type: 'file', data: fileEventData, timestamp: '2026-01-01T00:00:01Z' },
    { type: 'input', data: 'ls', timestamp: '2026-01-01T00:00:02Z' },
    {
      type: 'file',
      data: JSON.stringify({
        filename: 'image.png',
        mimeType: 'image/png',
        sizeBytes: 2048,
        writtenPath: '/tmp/image.png',
        transferId: 'transfer-2',
      }),
      timestamp: '2026-01-01T00:00:03Z',
    },
    { type: 'output', data: 'done', timestamp: '2026-01-01T00:00:04Z' },
  ];

  it('should collect file events up to the specified index', () => {
    const result = collectFileEventsUpTo(events, 3);

    expect(result).toHaveLength(2);
    expect(result[0]?.event.filename).toBe('test.txt');
    expect(result[0]?.eventIndex).toBe(1);
    expect(result[1]?.event.filename).toBe('image.png');
    expect(result[1]?.eventIndex).toBe(3);
  });

  it('should collect only file events before the index', () => {
    const result = collectFileEventsUpTo(events, 1);

    expect(result).toHaveLength(1);
    expect(result[0]?.event.filename).toBe('test.txt');
  });

  it('should return empty array when no file events exist before index', () => {
    const result = collectFileEventsUpTo(events, 0);
    expect(result).toHaveLength(0);
  });

  it('should handle empty events array', () => {
    const result = collectFileEventsUpTo([], 5);
    expect(result).toHaveLength(0);
  });

  it('should skip file events with invalid JSON data', () => {
    const eventsWithBadFile: RecordingEvent[] = [
      {
        type: 'file',
        data: 'not-valid-json',
        timestamp: '2026-01-01T00:00:00Z',
      },
      { type: 'file', data: fileEventData, timestamp: '2026-01-01T00:00:01Z' },
    ];

    const result = collectFileEventsUpTo(eventsWithBadFile, 1);
    expect(result).toHaveLength(1);
    expect(result[0]?.event.filename).toBe('test.txt');
    expect(result[0]?.eventIndex).toBe(1);
  });

  it('should handle upToIndex beyond events length', () => {
    const result = collectFileEventsUpTo(events, 100);
    expect(result).toHaveLength(2);
  });

  it('should preserve timestamp in collected events', () => {
    const result = collectFileEventsUpTo(events, 1);
    expect(result[0]?.timestamp).toBe('2026-01-01T00:00:01Z');
  });
});
