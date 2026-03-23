import { DateRangeFilter } from '@domains/shared/filters/date-range-filter';

interface AuditLogDateRangeFilterProps {
  startDate?: string;
  onChange: (range: { startDate?: string; endDate?: string }) => void;
}

export function AuditLogDateRangeFilter({
  startDate,
  onChange,
}: AuditLogDateRangeFilterProps) {
  return (
    <DateRangeFilter
      startDate={startDate}
      onChange={onChange}
      allLabel="Any Time"
      ariaLabel="Filter by date range"
    />
  );
}
