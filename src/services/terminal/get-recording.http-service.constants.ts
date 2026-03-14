import type { RecordingData } from '@services/terminal/get-recording.http-service';

export type RecordingStorageTier = NonNullable<
  RecordingData['recordingStorageTier']
>;

export const RECORDING_STORAGE_TIER = {
  HOT: 'hot',
  COLD: 'cold',
  RESTORING: 'restoring',
} as const satisfies Record<string, RecordingStorageTier>;
