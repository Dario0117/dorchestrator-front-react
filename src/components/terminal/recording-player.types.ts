import type { RecordingChunkItem } from '@services/terminal/get-recording.http-service';

export type RecordingEventType = 'input' | 'output' | 'file' | 'resize';

export interface RecordingEvent {
  type: RecordingEventType;
  data: string;
  timestamp: string;
}

export type PlaybackSpeed = 0.5 | 1 | 2 | 4;

export type PlaybackStatus = 'idle' | 'playing' | 'paused' | 'finished';

export interface PlaybackState {
  status: PlaybackStatus;
  speed: PlaybackSpeed;
  currentEventIndex: number;
  totalEvents: number;
  elapsedMs: number;
  totalDurationMs: number;
}

export interface FileEventMetadata {
  filename: string;
  mimeType: string;
  sizeBytes: number;
  writtenPath: string;
  transferId: string;
}

export interface ImageMapping {
  [filename: string]: number;
}

export interface RecordingPlayerProps {
  chunks: RecordingChunkItem[];
  durationSeconds: number;
  fontSize?: number;
  organizationId?: string;
  sessionId?: number;
  imageMap?: ImageMapping;
}
