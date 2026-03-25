import { CodeText } from '@components/ds/atoms/code-text';
import { SmallText } from '@components/ds/atoms/small-text';
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@components/ds/atoms/table';
import { DataTable } from '@components/ds/organisms/data-table';
import { CommandStatusBadge } from '@domains/commands/components/command-status-badge';
import type { ListCommandsCommand } from '@domains/commands/services/list-commands.http-service';
import { formatRelativeTime } from '@lib/format-relative-time';

interface CommandsTableProps {
  commands: ListCommandsCommand[];
  onRowClick: (commandId: number) => void;
}

export function CommandsTable({ commands, onRowClick }: CommandsTableProps) {
  return (
    <DataTable>
      <TableHeader>
        <TableRow>
          <TableHead>Status</TableHead>
          <TableHead>Command</TableHead>
          <TableHead>Device</TableHead>
          <TableHead>User</TableHead>
          <TableHead>Duration</TableHead>
          <TableHead>Time</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {commands.map((command) => (
          <TableRow
            key={command.id}
            clickable
            height="tall"
            onClick={() => onRowClick(command.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onRowClick(command.id);
              }
            }}
            tabIndex={0}
            aria-label={`View command #${command.id}`}
          >
            <TableCell>
              <CommandStatusBadge status={command.status} />
            </TableCell>
            <TableCell weight="medium">
              <CodeText truncate>{command.command}</CodeText>
            </TableCell>
            <TableCell>
              <SmallText truncate>{command.deviceName}</SmallText>
            </TableCell>
            <TableCell>
              <SmallText
                truncate
                color="muted"
              >
                {command.userEmail}
              </SmallText>
            </TableCell>
            <TableCell>
              {command.duration ? (
                <SmallText
                  mono
                  tabularNums
                >
                  {command.duration}
                </SmallText>
              ) : (
                <SmallText color="muted">—</SmallText>
              )}
            </TableCell>
            <TableCell>
              <SmallText color="muted">
                {formatRelativeTime(command.createdAt)}
              </SmallText>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </DataTable>
  );
}
