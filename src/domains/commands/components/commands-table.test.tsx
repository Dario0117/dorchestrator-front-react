import { CommandsTable } from '@domains/commands/components/commands-table';
import type { ListCommandsCommand } from '@domains/commands/services/list-commands.http-service';
import { renderWithProviders } from '@lib/test-wrappers.utils';
import { fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const mockCommands: ListCommandsCommand[] = [
  {
    id: 1,
    command: 'echo "hello"',
    status: 'completed',
    deviceName: 'Test Server',
    userEmail: 'admin@test.com',
    platform: 'linux',
    duration: '5s',
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    command: 'ls -la',
    status: 'running',
    deviceName: 'Dev Laptop',
    userEmail: 'dev@test.com',
    platform: 'macos',
    duration: null,
    createdAt: new Date().toISOString(),
  },
];

describe('CommandsTable', () => {
  it('should render table headers', () => {
    renderWithProviders(
      <CommandsTable
        commands={mockCommands}
        onRowClick={vi.fn()}
      />,
    );

    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Command')).toBeInTheDocument();
    expect(screen.getByText('Device')).toBeInTheDocument();
    expect(screen.getByText('User')).toBeInTheDocument();
    expect(screen.getByText('Duration')).toBeInTheDocument();
    expect(screen.getByText('Time')).toBeInTheDocument();
  });

  it('should render command data in rows', () => {
    renderWithProviders(
      <CommandsTable
        commands={mockCommands}
        onRowClick={vi.fn()}
      />,
    );

    expect(screen.getByText('echo "hello"')).toBeInTheDocument();
    expect(screen.getByText('ls -la')).toBeInTheDocument();
    expect(screen.getByText('Test Server')).toBeInTheDocument();
    expect(screen.getByText('Dev Laptop')).toBeInTheDocument();
    expect(screen.getByText('admin@test.com')).toBeInTheDocument();
    expect(screen.getByText('dev@test.com')).toBeInTheDocument();
  });

  it('should render duration or dash for null duration', () => {
    renderWithProviders(
      <CommandsTable
        commands={mockCommands}
        onRowClick={vi.fn()}
      />,
    );

    expect(screen.getByText('5s')).toBeInTheDocument();
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('should call onRowClick when a row is clicked', async () => {
    const user = userEvent.setup();
    const onRowClick = vi.fn();

    renderWithProviders(
      <CommandsTable
        commands={mockCommands}
        onRowClick={onRowClick}
      />,
    );

    await user.click(screen.getByText('echo "hello"'));

    expect(onRowClick).toHaveBeenCalledWith(1);
  });

  it('should call onRowClick when Enter key is pressed on a row', async () => {
    const user = userEvent.setup();
    const onRowClick = vi.fn();

    renderWithProviders(
      <CommandsTable
        commands={mockCommands}
        onRowClick={onRowClick}
      />,
    );

    const row = screen.getByLabelText('View command #1');
    row.focus();
    await user.keyboard('{Enter}');

    expect(onRowClick).toHaveBeenCalledWith(1);
  });

  it('should call onRowClick when Space key is pressed on a row', async () => {
    const user = userEvent.setup();
    const onRowClick = vi.fn();

    renderWithProviders(
      <CommandsTable
        commands={mockCommands}
        onRowClick={onRowClick}
      />,
    );

    const row = screen.getByLabelText('View command #2');
    row.focus();
    await user.keyboard(' ');

    expect(onRowClick).toHaveBeenCalledWith(2);
  });

  it('should not call onRowClick when a non-interactive key is pressed on a row', () => {
    const onRowClick = vi.fn();

    renderWithProviders(
      <CommandsTable
        commands={mockCommands}
        onRowClick={onRowClick}
      />,
    );

    const row = screen.getByLabelText('View command #1');
    fireEvent.keyDown(row, { key: 'Tab' });

    expect(onRowClick).not.toHaveBeenCalled();
  });

  it('should render status badges for each command', () => {
    renderWithProviders(
      <CommandsTable
        commands={mockCommands}
        onRowClick={vi.fn()}
      />,
    );

    expect(screen.getByText('Completed')).toBeInTheDocument();
    expect(screen.getByText('Running')).toBeInTheDocument();
  });
});
