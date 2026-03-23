import {
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@components/ds/atoms/table';
import type { AuditLogEntry } from '@domains/audit-logs/services/list-audit-logs.http-service';
import { AuditLogRow } from '@domains/audit-logs/tables/audit-log-row';

interface AuditLogsTableProps {
  entries: AuditLogEntry[];
}

export function AuditLogsTable({ entries }: AuditLogsTableProps) {
  return (
    <>
      <TableHeader>
        <TableRow>
          <TableHead>Time</TableHead>
          <TableHead>Action</TableHead>
          <TableHead>Resource</TableHead>
          <TableHead>Team</TableHead>
          <TableHead>Actor</TableHead>
          <TableHead>Resource ID</TableHead>
          <TableHead>Request ID</TableHead>
          <TableHead className="w-[40px]" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {entries.map((entry) => (
          <AuditLogRow
            key={entry.id}
            entry={entry}
          />
        ))}
      </TableBody>
    </>
  );
}
