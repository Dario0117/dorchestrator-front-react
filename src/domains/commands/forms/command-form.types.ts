import type { SandboxPresetItem } from '@domains/sandbox/services/list-sandbox-presets.http-service';

export interface SandboxState {
  activePresetId: number;
  effectivePresetId: number;
  isSandboxOverride: boolean;
  approvalPending: boolean;
  onPresetChange: (value: number | null) => void;
  presets: SandboxPresetItem[];
}
