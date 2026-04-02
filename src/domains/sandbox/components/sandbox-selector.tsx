import { Badge } from '@components/ds/atoms/badge';
import { Label } from '@components/ds/atoms/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/ds/atoms/select';
import { SmallParagraph } from '@components/ds/atoms/small-paragraph';
import { Stack } from '@components/ds/atoms/stack';
import type { SandboxPresetItem } from '@domains/sandbox/services/list-sandbox-presets.http-service';

type SandboxSelectorProps = {
  value: number;
  onChange: (value: number | null) => void;
  effectivePresetId: number;
  presets: SandboxPresetItem[];
  disabled?: boolean;
};

export function SandboxSelector({
  value,
  onChange,
  effectivePresetId,
  presets,
  disabled,
}: SandboxSelectorProps) {
  const isOverride = value !== effectivePresetId;
  const selectedPreset = presets.find((p) => p.id === value);

  return (
    <Stack gap="sm">
      <Label>Sandbox Preset</Label>
      <Select
        value={String(value)}
        onValueChange={(val) => {
          if (val !== null) {
            onChange(Number(val));
          }
        }}
        disabled={disabled}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select sandbox preset">
            {selectedPreset?.name}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {presets.map((preset) => (
            <SelectItem
              key={preset.id}
              value={String(preset.id)}
            >
              {preset.name}
              {preset.id === effectivePresetId ? ' (default)' : ''}
              {preset.requiresApproval ? ' - requires approval' : ''}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {selectedPreset?.requiresApproval && isOverride && (
        <SmallParagraph>
          Requires admin approval — this preset requires approval to use.
        </SmallParagraph>
      )}
      {isOverride && !selectedPreset?.requiresApproval && (
        <SmallParagraph>Different from device default preset.</SmallParagraph>
      )}
      {selectedPreset?.isOrgDefault && isOverride && (
        <Badge variant="secondary">Default</Badge>
      )}
    </Stack>
  );
}
