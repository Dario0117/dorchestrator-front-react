import { Input } from '@components/ds/atoms/input';
import { Stack } from '@components/ds/atoms/stack';

interface DateInputRangeFilterProps {
  dateFrom?: string;
  dateTo?: string;
  onChange: (range: { dateFrom?: string; dateTo?: string }) => void;
  fullWidth?: boolean;
}

export function DateInputRangeFilter({
  dateFrom,
  dateTo,
  onChange,
  fullWidth,
}: DateInputRangeFilterProps) {
  const handleDateFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onChange({
      dateFrom: value || undefined,
      dateTo,
    });
  };

  const handleDateToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onChange({
      dateFrom,
      dateTo: value || undefined,
    });
  };

  return (
    <Stack gap="sm">
      <Input
        type="date"
        aria-label="From date"
        value={dateFrom ?? ''}
        max={dateTo}
        onChange={handleDateFromChange}
        placeholder="From"
        fullWidth={fullWidth}
      />
      <Input
        type="date"
        aria-label="To date"
        value={dateTo ?? ''}
        min={dateFrom}
        onChange={handleDateToChange}
        placeholder="To"
        fullWidth={fullWidth}
      />
    </Stack>
  );
}
