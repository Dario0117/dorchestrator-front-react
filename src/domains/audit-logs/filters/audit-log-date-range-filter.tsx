import { DateRangeFilter } from '@domains/shared/filters/date-range-filter';

interface AuditLogDateRangeFilterProps {
  startDate?: string;
  onChange: (range: { startDate?: string; endDate?: string }) => void;
  fullWidth?: boolean;
}

export function AuditLogDateRangeFilter({
  startDate,
  onChange,
  fullWidth,
}: AuditLogDateRangeFilterProps) {
  return (
    <DateRangeFilter
      startDate={startDate}
      onChange={onChange}
      allLabel="Any Time"
      ariaLabel="Filter by date range"
      fullWidth={fullWidth}
    />
  );
}
