import { Table } from '@components/ds/atoms/table';
import type { TerminalSessionListItem } from '@domains/terminal/services/list-terminal-sessions.http-service';
import { TerminalSessionsTable } from '@domains/terminal/tables/terminal-sessions-table';
import { clickTrigger, renderWithProviders } from '@lib/test-wrappers.utils';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const mockSessions: TerminalSessionListItem[] = [
  {
    id: 1,
    deviceId: 10,
    userId: 'u-1',
    userName: 'Alice',
    userEmail: 'alice@example.com',
    deviceName: 'Server-1',
    status: 'active' as const,
    shell: '/bin/bash',
    createdAt: '2025-06-15T10:00:00.000Z',
    lastActivityAt: '2025-06-15T10:30:00.000Z',
    terminatedAt: null,
    durationSeconds: 1800,
    recordingSizeBytes: 1024,
  },
  {
    id: 2,
    deviceId: 20,
    userId: 'u-2',
    userName: 'Bob',
    userEmail: 'bob@example.com',
    deviceName: 'Laptop-1',
    status: 'terminated' as const,
    shell: '/bin/zsh',
    createdAt: '2025-06-15T08:00:00.000Z',
    lastActivityAt: '2025-06-15T09:00:00.000Z',
    terminatedAt: '2025-06-15T09:00:00.000Z',
    durationSeconds: 3600,
    recordingSizeBytes: 2048,
  },
];

const defaultProps = {
  sessions: mockSessions,
  onRowClick: vi.fn(),
  onCloseSession: vi.fn(),
  terminateMutation: {
    isPending: false,
    variables: undefined,
  } as never,
};

function renderTable(props = defaultProps) {
  return renderWithProviders(
    <Table>
      <TerminalSessionsTable {...props} />
    </Table>,
  );
}

describe('TerminalSessionsTable', () => {
  it('renders column headers', () => {
    renderTable();
    expect(screen.getByText('User')).toBeInTheDocument();
    expect(screen.getByText('Device')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Created')).toBeInTheDocument();
    expect(screen.getByText('Duration')).toBeInTheDocument();
    expect(screen.getByText('Recording')).toBeInTheDocument();
  });

  it('renders session data', () => {
    renderTable();
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('alice@example.com')).toBeInTheDocument();
    expect(screen.getByText('Server-1')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText('Laptop-1')).toBeInTheDocument();
  });

  it('calls onRowClick when a row is clicked', async () => {
    const onRowClick = vi.fn();
    const user = userEvent.setup();
    renderTable({ ...defaultProps, onRowClick });
    await user.click(screen.getByText('Server-1'));
    expect(onRowClick).toHaveBeenCalledWith(1);
  });

  it('calls onRowClick on Enter key', async () => {
    const onRowClick = vi.fn();
    renderTable({ ...defaultProps, onRowClick });
    const row = screen.getByText('Server-1').closest('tr');
    row?.focus();
    await userEvent.keyboard('{Enter}');
    expect(onRowClick).toHaveBeenCalledWith(1);
  });

  it('shows close button only for non-terminated sessions', () => {
    renderTable();
    const closeButtons = screen.getAllByLabelText('Close session');
    expect(closeButtons).toHaveLength(1);
  });

  it('shows confirmation dialog when close button clicked', async () => {
    renderTable();
    const closeButton = screen.getByLabelText('Close session');
    await clickTrigger(closeButton);
    expect(screen.getByText('Close terminal session?')).toBeInTheDocument();
    expect(
      screen.getByText(/terminate the session on Server-1/),
    ).toBeInTheDocument();
  });

  it('shows "Never" when createdAt is empty and lastActivityAt is null', () => {
    const sessionWithFalsyDates: TerminalSessionListItem = {
      id: 3,
      deviceId: 30,
      userId: 'u-3',
      userName: 'Charlie',
      userEmail: 'charlie@example.com',
      deviceName: 'Server-3',
      status: 'active',
      shell: '/bin/bash',
      createdAt: '',
      lastActivityAt: null,
      terminatedAt: null,
      durationSeconds: 600,
      recordingSizeBytes: 512,
    };
    renderTable({
      ...defaultProps,
      sessions: [sessionWithFalsyDates],
    });
    const neverCells = screen.getAllByText('Never');
    expect(neverCells).toHaveLength(2);
  });
});
