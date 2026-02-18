import { CommandCard } from '@components/commands/command-card';
import { renderWithProviders } from '@lib/test-wrappers.utils';
import type { ListCommandsCommand } from '@services/commands/list-commands.http-service';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const mockCommand: ListCommandsCommand = {
  id: 42,
  command: 'echo "hello world"',
  status: 'completed',
  deviceName: 'Test Server',
  userEmail: 'admin@example.com',
  platform: 'linux',
  duration: '17s',
  createdAt: new Date(Date.now() - 3600000).toISOString(),
};

describe('CommandCard', () => {
  it('should render the command ID', () => {
    renderWithProviders(<CommandCard command={mockCommand} />);
    expect(screen.getByText('#42')).toBeInTheDocument();
  });

  it('should render the status badge', () => {
    renderWithProviders(<CommandCard command={mockCommand} />);
    expect(screen.getByText('Completed')).toBeInTheDocument();
  });

  it('should render the device name', () => {
    renderWithProviders(<CommandCard command={mockCommand} />);
    expect(screen.getByText('Test Server')).toBeInTheDocument();
  });

  it('should render the command text', () => {
    renderWithProviders(<CommandCard command={mockCommand} />);
    expect(screen.getByText('echo "hello world"')).toBeInTheDocument();
  });

  it('should render the user email', () => {
    renderWithProviders(<CommandCard command={mockCommand} />);
    expect(
      screen.getByText('Submitted by: admin@example.com'),
    ).toBeInTheDocument();
  });

  it('should render duration when present', () => {
    renderWithProviders(<CommandCard command={mockCommand} />);
    expect(screen.getByText('17s')).toBeInTheDocument();
  });

  it('should not render duration when null', () => {
    const noDurationCommand: ListCommandsCommand = {
      ...mockCommand,
      duration: null,
    };
    renderWithProviders(<CommandCard command={noDurationCommand} />);
    expect(screen.queryByText(/\ds/)).not.toBeInTheDocument();
  });

  it('should truncate command text at 100 characters', () => {
    const longCommandText = 'a'.repeat(150);
    const longCommand: ListCommandsCommand = {
      ...mockCommand,
      command: longCommandText,
    };
    renderWithProviders(<CommandCard command={longCommand} />);

    const truncated = `${'a'.repeat(100)}...`;
    expect(screen.getByText(truncated)).toBeInTheDocument();
  });

  it('should show tooltip with full text for truncated commands', () => {
    const longCommandText = 'a'.repeat(150);
    const longCommand: ListCommandsCommand = {
      ...mockCommand,
      command: longCommandText,
    };
    renderWithProviders(<CommandCard command={longCommand} />);

    const element = screen.getByTitle(longCommandText);
    expect(element).toBeInTheDocument();
  });

  it('should show tooltip with full command for all commands', () => {
    renderWithProviders(<CommandCard command={mockCommand} />);
    const commandElement = screen.getByText('echo "hello world"');
    expect(commandElement).toHaveAttribute('title', 'echo "hello world"');
  });

  it('should render a relative timestamp', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-02-17T12:00:00.000Z'));

    const command: ListCommandsCommand = {
      ...mockCommand,
      createdAt: '2026-02-17T11:00:00.000Z',
    };
    renderWithProviders(<CommandCard command={command} />);
    expect(screen.getByText(/1 hour ago/)).toBeInTheDocument();

    vi.useRealTimers();
  });

  it('should call onClick when card is clicked', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    renderWithProviders(
      <CommandCard
        command={mockCommand}
        onClick={handleClick}
      />,
    );

    await user.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should call onClick on Enter key', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    renderWithProviders(
      <CommandCard
        command={mockCommand}
        onClick={handleClick}
      />,
    );

    const card = screen.getByRole('button');
    card.focus();
    await user.keyboard('{Enter}');
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should not have button role when no onClick', () => {
    renderWithProviders(<CommandCard command={mockCommand} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
