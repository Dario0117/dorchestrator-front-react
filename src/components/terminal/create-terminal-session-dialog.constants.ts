export const MS_PER_MINUTE = 60 * 1000;
export const MS_PER_HOUR = 60 * 60 * 1000;

export interface TimeoutPreset {
  value: string;
  label: string;
  ms: number;
}

export const INACTIVITY_PRESETS = [
  { value: '15', label: '15 minutes', ms: 15 * MS_PER_MINUTE },
  { value: '30', label: '30 minutes', ms: 30 * MS_PER_MINUTE },
  { value: '60', label: '1 hour', ms: 60 * MS_PER_MINUTE },
  { value: '120', label: '2 hours', ms: 120 * MS_PER_MINUTE },
] as const satisfies readonly TimeoutPreset[];

export const HARD_CAP_PRESETS = [
  { value: '1', label: '1 hour', ms: 1 * MS_PER_HOUR },
  { value: '2', label: '2 hours', ms: 2 * MS_PER_HOUR },
  { value: '4', label: '4 hours', ms: 4 * MS_PER_HOUR },
  { value: '8', label: '8 hours', ms: 8 * MS_PER_HOUR },
  { value: '24', label: '24 hours', ms: 24 * MS_PER_HOUR },
] as const satisfies readonly TimeoutPreset[];

type InactivityPresetValue = (typeof INACTIVITY_PRESETS)[number]['value'];
type HardCapPresetValue = (typeof HARD_CAP_PRESETS)[number]['value'];

export type InactivitySelection = 'max' | 'custom' | InactivityPresetValue;
export type HardCapSelection = 'max' | 'custom' | HardCapPresetValue;

export function filterPresets(
  presets: readonly TimeoutPreset[],
  ceilingMs: number,
) {
  return presets.filter((p) => p.ms <= ceilingMs);
}
