import type { RecordingData } from '@domains/terminal/services/get-recording.http-service';

export type RecordingStorageTier = NonNullable<
  RecordingData['recordingStorageTier']
>;

export const RECORDING_STORAGE_TIER = {
  HOT: 'hot',
  COLD: 'cold',
  RESTORING: 'restoring',
} as const satisfies Record<string, RecordingStorageTier>;
