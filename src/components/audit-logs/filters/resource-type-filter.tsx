import { SelectFilter } from '@components/commands/filters/status-filter';
import {
  AUDIT_LOG_RESOURCE_TYPE_LABELS,
  type AuditLogResourceType,
} from '@services/audit-logs/list-audit-logs.http-service.constants';

const RESOURCE_TYPE_OPTIONS = (
  Object.entries(AUDIT_LOG_RESOURCE_TYPE_LABELS) as [
    AuditLogResourceType,
    string,
  ][]
).map(([value, label]) => ({ value, label }));

interface ResourceTypeFilterProps {
  value?: string;
  onChange: (value: string | undefined) => void;
}

export function ResourceTypeFilter({
  value,
  onChange,
}: ResourceTypeFilterProps) {
  return (
    <SelectFilter
      value={value}
      onChange={onChange}
      options={RESOURCE_TYPE_OPTIONS}
      allLabel="All Resources"
      ariaLabel="Filter by resource type"
    />
  );
}
