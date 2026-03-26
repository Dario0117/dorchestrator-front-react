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
  fullWidth?: boolean;
}

function toDateOnly(date: Date) {
  return date.toISOString().slice(0, 10);
}

function getDateRange(preset: string, presets: DatePreset[]) {
  const match = presets.find((p) => p.value === preset) as DatePreset;
  const now = new Date();
  return {
    startDate: toDateOnly(new Date(now.getTime() - match.offsetMs)),
    endDate: toDateOnly(now),
  };
}

function getCurrentPreset(
  startDate: string | undefined,
  presets: DatePreset[],
) {
  if (!startDate) {
    return undefined;
  }

  const MS_PER_DAY = 24 * 60 * 60 * 1000;
  const now = Date.now();
  const start = new Date(startDate).getTime();
  const dayDiff = Math.round((now - start) / MS_PER_DAY);

  for (const preset of presets) {
    const presetDays = Math.round(preset.offsetMs / MS_PER_DAY);
    if (dayDiff === presetDays) {
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
  fullWidth,
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
      fullWidth={fullWidth}
    />
  );
}
