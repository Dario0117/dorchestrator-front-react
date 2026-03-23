import type { AuditLogAction } from '@domains/audit-logs/services/list-audit-logs.http-service.constants';
import { SelectFilter } from '@domains/shared/filters/select-filter';

const ACTION_OPTIONS = [
  { value: 'created', label: 'Created' },
  { value: 'updated', label: 'Updated' },
  { value: 'deleted', label: 'Deleted' },
] as const satisfies readonly { value: AuditLogAction; label: string }[];

interface ActionFilterProps {
  value?: string;
  onChange: (value: string | undefined) => void;
}

export function ActionFilter({ value, onChange }: ActionFilterProps) {
  return (
    <SelectFilter
      value={value}
      onChange={onChange}
      options={[...ACTION_OPTIONS]}
      allLabel="All Actions"
      ariaLabel="Filter by action"
    />
  );
}
