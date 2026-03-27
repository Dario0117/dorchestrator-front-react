import { Table } from '@components/ds/atoms/table';
import type { AuditLogEntry } from '@domains/audit-logs/services/list-audit-logs.http-service';
import { AuditLogsTable } from '@domains/audit-logs/tables/audit-logs-table';
import { renderWithProviders } from '@lib/test-wrappers.utils';
import { screen } from '@testing-library/react';

const mockEntries: AuditLogEntry[] = [
  {
    id: 'al-1',
    organizationId: 'org-1',
    actorId: 'user-1',
    actorEmail: 'alice@example.com',
    action: 'created',
    resourceType: 'command',
    resourceId: 'cmd-1',
    metadata: null,
    clientIp: '192.168.1.1',
    requestId: 'req-1',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'al-2',
    organizationId: 'org-1',
    actorId: 'user-2',
    actorEmail: 'bob@example.com',
    action: 'deleted',
    resourceType: 'device',
    resourceId: 'dev-1',
    metadata: null,
    clientIp: '192.168.1.2',
    requestId: 'req-2',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
];

function renderTable(entries = mockEntries) {
  return renderWithProviders(
    <Table>
      <AuditLogsTable entries={entries} />
    </Table>,
  );
}

describe('AuditLogsTable', () => {
  it('renders column headers', () => {
    renderTable();
    expect(screen.getByText('Time')).toBeInTheDocument();
    expect(screen.getByText('Action')).toBeInTheDocument();
    expect(screen.getByText('Resource')).toBeInTheDocument();
    expect(screen.getByText('Actor')).toBeInTheDocument();
  });

  it('renders rows for each entry', () => {
    renderTable();
    expect(screen.getByText('alice@example.com')).toBeInTheDocument();
    expect(screen.getByText('bob@example.com')).toBeInTheDocument();
  });

  it('renders action badges', () => {
    renderTable();
    expect(screen.getByText('Created')).toBeInTheDocument();
    expect(screen.getByText('Deleted')).toBeInTheDocument();
  });

  it('renders empty table body when no entries', () => {
    renderTable([]);
    expect(screen.getByText('Time')).toBeInTheDocument();
    expect(screen.queryByText('alice@example.com')).not.toBeInTheDocument();
  });
});
