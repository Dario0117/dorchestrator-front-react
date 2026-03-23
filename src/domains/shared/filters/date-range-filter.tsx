import { SelectFilter } from '@domains/shared/filters/select-filter';

export interface DatePreset {
  value: string;
  label: string;
  offsetMs: number;
}

const DEFAULT_PRESETS: DatePreset[] = [
  { value: '24h', label: 'Last 24 hours', offsetMs: 24 * 60 * 60 * 1000 },
  { value: '7d', label: 'Last 7 days', offsetMs: 7 * 24 * 60 * 60 * 1000 },
  { value: '30d', label: 'Last 30 days', offsetMs: 30 * 24 * 60 * 60 * 1000 },
];

interface DateRangeFilterProps {
  startDate?: string;
  onChange: (range: { startDate?: string; endDate?: string }) => void;
  presets?: DatePreset[];
  allLabel?: string;
  ariaLabel?: string;
}

function getDateRange(preset: string, presets: DatePreset[]) {
  const match = presets.find((p) => p.value === preset) as DatePreset;
  const now = new Date();
  return {
    startDate: new Date(now.getTime() - match.offsetMs).toISOString(),
    endDate: now.toISOString(),
  };
}

function getCurrentPreset(
  startDate: string | undefined,
  presets: DatePreset[],
) {
  if (!startDate) {
    return undefined;
  }

  const now = Date.now();
  const start = new Date(startDate).getTime();
  const diffMs = now - start;

  // Find closest preset within 1-hour tolerance
  const tolerance = 60 * 60 * 1000;
  for (const preset of presets) {
    if (Math.abs(diffMs - preset.offsetMs) < tolerance) {
      return preset.value;
    }
  }

  return undefined;
}

export function DateRangeFilter({
  startDate,
  onChange,
  presets = DEFAULT_PRESETS,
  allLabel = 'Any Time',
  ariaLabel = 'Filter by date range',
}: DateRangeFilterProps) {
  const currentPreset = getCurrentPreset(startDate, presets);

  const options = presets.map((p) => ({
    value: p.value,
    label: p.label,
  }));

  const handleChange = (value: string | undefined) => {
    if (!value) {
      onChange({ startDate: undefined, endDate: undefined });
      return;
    }
    onChange(getDateRange(value, presets));
  };

  return (
    <SelectFilter
      value={currentPreset}
      onChange={handleChange}
      options={options}
      allLabel={allLabel}
      ariaLabel={ariaLabel}
    />
  );
}
