import { CommandCard } from '@components/commands/command-card';
import type { ListCommandsCommand } from '@services/commands/list-commands.http-service';
import { render, screen } from '@testing-library/react';

const mockCommand: ListCommandsCommand = {
  id: 42,
  command: 'echo "hello world"',
  status: 'completed',
  deviceName: 'Test Server',
  createdAt: '2024-06-15T12:30:00.000Z',
};

describe('CommandCard', () => {
  it('should render the command ID', () => {
    render(<CommandCard command={mockCommand} />);
    expect(screen.getByText('#42')).toBeInTheDocument();
  });

  it('should render the status badge', () => {
    render(<CommandCard command={mockCommand} />);
    expect(screen.getByText('Completed')).toBeInTheDocument();
  });

  it('should render the device name', () => {
    render(<CommandCard command={mockCommand} />);
    expect(screen.getByText('Test Server')).toBeInTheDocument();
  });

  it('should render the command text', () => {
    render(<CommandCard command={mockCommand} />);
    expect(screen.getByText('echo "hello world"')).toBeInTheDocument();
  });

  it('should render the formatted date', () => {
    render(<CommandCard command={mockCommand} />);
    // The formatted date includes "Jun 15"
    expect(screen.getByText(/Jun 15/)).toBeInTheDocument();
  });

  it('should truncate long command text', () => {
    const longCommand: ListCommandsCommand = {
      ...mockCommand,
      command: 'a'.repeat(500),
    };
    render(<CommandCard command={longCommand} />);

    const commandElement = screen.getByTitle('a'.repeat(500));
    expect(commandElement).toBeInTheDocument();
    expect(commandElement).toHaveClass('truncate');
  });
});
