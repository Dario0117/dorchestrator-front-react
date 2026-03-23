import type {
  FileEventMetadata,
  RecordingEvent,
} from '@domains/terminal/components/recording-player.types';

export interface VisibleFileEvent {
  event: FileEventMetadata;
  timestamp: string;
  eventIndex: number;
}

export function formatTimestamp(isoString: string) {
  return new Date(isoString).toISOString().replace('T', ' ').slice(0, 19);
}

export function tryParseFileEvent(data: string): FileEventMetadata | null {
  try {
    const parsed = JSON.parse(data);
    if (parsed.filename && parsed.mimeType) {
      return parsed as FileEventMetadata;
    }
  } catch {
    // Not a file event JSON
  }
  return null;
}

export function collectFileEventsUpTo(
  events: RecordingEvent[],
  upToIndex: number,
): VisibleFileEvent[] {
  const result: VisibleFileEvent[] = [];
  for (let i = 0; i <= upToIndex && i < events.length; i++) {
    const event = events[i];
    if (event?.type === 'file') {
      const parsed = tryParseFileEvent(event.data);
      if (parsed) {
        result.push({
          event: parsed,
          timestamp: event.timestamp,
          eventIndex: i,
        });
      }
    }
  }
  return result;
}
