import { AuditLogRow } from '@components/audit-logs/audit-log-row';
import { Table, TableBody } from '@components/ui/table';
import { renderWithProviders } from '@lib/test-wrappers.utils';
import type { AuditLogEntry } from '@services/audit-logs/list-audit-logs.http-service';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const mockEntry: AuditLogEntry = {
  id: 'al-1',
  organizationId: 'org-123',
  actorId: 'user-1',
  actorEmail: 'admin@org.com',
  action: 'created',
  resourceType: 'command',
  resourceId: 'cmd-1',
  metadata: {
    after: { command: 'echo test', status: 'pending' },
  },
  clientIp: '192.168.1.1',
  requestId: 'req-1',
  createdAt: new Date(Date.now() - 3600000).toISOString(),
};

function renderRow(entry: AuditLogEntry = mockEntry) {
  return renderWithProviders(
    <Table>
      <TableBody>
        <AuditLogRow entry={entry} />
      </TableBody>
    </Table>,
  );
}

describe('AuditLogRow', () => {
  it('should render the action badge with correct label', () => {
    renderRow();
    expect(screen.getByText('Created')).toBeInTheDocument();
  });

  it('should render created badge with green styling', () => {
    renderRow();
    const badge = screen.getByText('Created');
    expect(badge.className).toContain('bg-green-100');
  });

  it('should render updated badge with blue styling', () => {
    const updatedEntry: AuditLogEntry = {
      ...mockEntry,
      action: 'updated',
      metadata: { after: { newStatus: 'completed' } },
    };
    renderRow(updatedEntry);
    const badge = screen.getByText('Updated');
    expect(badge.className).toContain('bg-blue-100');
  });

  it('should render deleted badge with red styling', () => {
    const deletedEntry: AuditLogEntry = {
      ...mockEntry,
      action: 'deleted',
      metadata: { before: { deviceId: 'dev-2' } },
    };
    renderRow(deletedEntry);
    const badge = screen.getByText('Deleted');
    expect(badge.className).toContain('bg-red-100');
  });

  it('should render the resource type badge', () => {
    renderRow();
    expect(screen.getByText('Command')).toBeInTheDocument();
  });

  it('should render the actor email', () => {
    renderRow();
    expect(screen.getByText('admin@org.com')).toBeInTheDocument();
  });

  it('should render copy button for actor', () => {
    renderRow();
    expect(screen.getByLabelText('Copy actor')).toBeInTheDocument();
  });

  it('should render "System" for null actor with copy button', () => {
    const systemEntry: AuditLogEntry = {
      ...mockEntry,
      actorId: null,
      actorEmail: null,
    };
    renderRow(systemEntry);
    expect(screen.getByText('System')).toBeInTheDocument();
    expect(screen.getByLabelText('Copy actor')).toBeInTheDocument();
  });

  it('should render a relative timestamp', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-02-17T12:00:00.000Z'));

    const entry: AuditLogEntry = {
      ...mockEntry,
      createdAt: '2026-02-17T11:00:00.000Z',
    };
    renderRow(entry);
    expect(screen.getByText(/1 hour ago/)).toBeInTheDocument();

    vi.useRealTimers();
  });

  it('should render absolute timestamp for old entries', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-02-17T12:00:00.000Z'));

    const entry: AuditLogEntry = {
      ...mockEntry,
      createdAt: '2026-02-10T10:00:00.000Z',
    };
    renderRow(entry);
    expect(screen.getByText(/Feb 10/)).toBeInTheDocument();

    vi.useRealTimers();
  });

  it('should render the full resource ID', () => {
    const longIdEntry: AuditLogEntry = {
      ...mockEntry,
      resourceId: '550e8400-e29b-41d4-a716-446655440000',
    };
    renderRow(longIdEntry);
    expect(
      screen.getByText('550e8400-e29b-41d4-a716-446655440000'),
    ).toBeInTheDocument();
  });

  it('should render copy button for resource ID', () => {
    renderRow();
    expect(screen.getByLabelText('Copy resource ID')).toBeInTheDocument();
  });

  it('should copy resource ID to clipboard when copy button is clicked', async () => {
    const user = userEvent.setup();
    const writeTextSpy = vi
      .spyOn(navigator.clipboard, 'writeText')
      .mockResolvedValue(undefined);

    renderRow();
    await user.click(screen.getByLabelText('Copy resource ID'));

    expect(writeTextSpy).toHaveBeenCalledWith('cmd-1');
    writeTextSpy.mockRestore();
  });

  it('should render the request ID when present', () => {
    renderRow();
    expect(screen.getByText('req-1')).toBeInTheDocument();
  });

  it('should render copy button for request ID', () => {
    renderRow();
    expect(screen.getByLabelText('Copy request ID')).toBeInTheDocument();
  });

  it('should copy request ID to clipboard when copy button is clicked', async () => {
    const user = userEvent.setup();
    const writeTextSpy = vi
      .spyOn(navigator.clipboard, 'writeText')
      .mockResolvedValue(undefined);

    renderRow();
    await user.click(screen.getByLabelText('Copy request ID'));

    expect(writeTextSpy).toHaveBeenCalledWith('req-1');
    writeTextSpy.mockRestore();
  });

  it('should show dash when request ID is null', () => {
    const noRequestIdEntry: AuditLogEntry = {
      ...mockEntry,
      requestId: null,
    };
    renderRow(noRequestIdEntry);
    expect(screen.queryByLabelText('Copy request ID')).not.toBeInTheDocument();
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('should expand metadata details on click', async () => {
    const user = userEvent.setup();
    renderRow();

    const row = screen.getByRole('button', { expanded: false });
    await user.click(row);

    expect(screen.getByText('After:')).toBeInTheDocument();
    expect(screen.getByText(/"command": "echo test"/)).toBeInTheDocument();
  });

  it('should collapse metadata details on second click', async () => {
    const user = userEvent.setup();
    renderRow();

    const row = screen.getByRole('button', { expanded: false });
    await user.click(row);
    expect(screen.getByText('After:')).toBeInTheDocument();

    await user.click(row);
    expect(screen.queryByText('After:')).not.toBeInTheDocument();
  });

  it('should expand on keyboard Enter', async () => {
    const user = userEvent.setup();
    renderRow();

    const row = screen.getByRole('button', { expanded: false });
    row.focus();
    await user.keyboard('{Enter}');

    expect(screen.getByText('After:')).toBeInTheDocument();
  });

  it('should expand on keyboard Space', async () => {
    const user = userEvent.setup();
    renderRow();

    const row = screen.getByRole('button', { expanded: false });
    row.focus();
    await user.keyboard(' ');

    expect(screen.getByText('After:')).toBeInTheDocument();
  });

  it('should show before/after labels when both exist', async () => {
    const user = userEvent.setup();
    const entryWithBoth: AuditLogEntry = {
      ...mockEntry,
      action: 'updated',
      metadata: {
        before: { status: 'pending' },
        after: { status: 'completed' },
      },
    };
    renderRow(entryWithBoth);

    const row = screen.getByRole('button', { expanded: false });
    await user.click(row);

    expect(screen.getByText('Before:')).toBeInTheDocument();
    expect(screen.getByText('After:')).toBeInTheDocument();
  });

  it('should have aria-expanded attribute on row', () => {
    renderRow();
    const row = screen.getByRole('button', { expanded: false });
    expect(row).toHaveAttribute('aria-expanded', 'false');
  });

  it('should update aria-expanded when expanded', async () => {
    const user = userEvent.setup();
    renderRow();

    const row = screen.getByRole('button', { expanded: false });
    await user.click(row);
    expect(row).toHaveAttribute('aria-expanded', 'true');
  });

  it('should not have expandable row when metadata is null', () => {
    const noMetadataEntry: AuditLogEntry = {
      ...mockEntry,
      metadata: null,
    };
    renderRow(noMetadataEntry);
    expect(
      screen.queryByRole('button', { expanded: false }),
    ).not.toBeInTheDocument();
  });

  it('should copy actor email to clipboard when copy actor button is clicked', async () => {
    const user = userEvent.setup();
    const writeTextSpy = vi
      .spyOn(navigator.clipboard, 'writeText')
      .mockResolvedValue(undefined);

    renderRow();
    await user.click(screen.getByLabelText('Copy actor'));

    expect(writeTextSpy).toHaveBeenCalledWith('admin@org.com');
    writeTextSpy.mockRestore();
  });

  it('should fall back to raw resourceType when no label is defined', () => {
    const unknownResourceEntry: AuditLogEntry = {
      ...mockEntry,
      resourceType: 'unknown_type' as AuditLogEntry['resourceType'],
    };
    renderRow(unknownResourceEntry);
    expect(screen.getByText('unknown_type')).toBeInTheDocument();
  });

  it('should render raw metadata when neither before nor after exist', async () => {
    const user = userEvent.setup();
    const rawMetadataEntry: AuditLogEntry = {
      ...mockEntry,
      metadata: {} as AuditLogEntry['metadata'],
    };
    renderRow(rawMetadataEntry);

    const row = screen.getByRole('button', { expanded: false });
    await user.click(row);

    expect(screen.queryByText('Before:')).not.toBeInTheDocument();
    expect(screen.queryByText('After:')).not.toBeInTheDocument();
  });

  it('should not toggle when a non-interactive key is pressed', async () => {
    const user = userEvent.setup();
    renderRow();

    const row = screen.getByRole('button', { expanded: false });
    row.focus();
    await user.keyboard('{Tab}');

    expect(row).toHaveAttribute('aria-expanded', 'false');
  });

  it('should render deactivated badge with amber styling', () => {
    const deactivatedEntry: AuditLogEntry = {
      ...mockEntry,
      action: 'deactivated',
    };
    renderRow(deactivatedEntry);
    const badge = screen.getByText('Deactivated');
    expect(badge.className).toContain('bg-amber-100');
  });
});
