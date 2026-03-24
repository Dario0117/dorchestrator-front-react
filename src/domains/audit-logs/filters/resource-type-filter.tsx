import {
  AUDIT_LOG_RESOURCE_TYPE_LABELS,
  type AuditLogResourceType,
} from '@domains/audit-logs/services/list-audit-logs.http-service.constants';
import { SelectFilter } from '@domains/shared/filters/select-filter';

const RESOURCE_TYPE_OPTIONS = (
  Object.entries(AUDIT_LOG_RESOURCE_TYPE_LABELS) as [
    AuditLogResourceType,
    string,
  ][]
).map(([value, label]) => ({ value, label }));

interface ResourceTypeFilterProps {
  value?: string;
  onChange: (value: string | undefined) => void;
  fullWidth?: boolean;
}

export function ResourceTypeFilter({
  value,
  onChange,
  fullWidth,
}: ResourceTypeFilterProps) {
  return (
    <SelectFilter
      value={value}
      onChange={onChange}
      options={RESOURCE_TYPE_OPTIONS}
      allLabel="All Resources"
      ariaLabel="Filter by resource type"
      fullWidth={fullWidth}
    />
  );
}
