import { CommandMetadata } from '@components/commands/command-metadata';
import { renderWithProviders } from '@lib/test-wrappers.utils';
import type { GetCommandDetail } from '@services/commands/get-command.http-service';
import { screen } from '@testing-library/react';

const baseCommand: GetCommandDetail = {
  id: 1,
  command: 'echo "hello world"',
  status: 'completed',
  deviceName: 'Test Server',
  submittedBy: 'test@example.com',
  createdAt: '2025-12-28T10:00:00.000Z',
  startedAt: '2025-12-28T10:01:00.000Z',
  completedAt: '2025-12-28T10:01:30.000Z',
  results: [],
};

describe('CommandMetadata', () => {
  it('should render command text in monospace', () => {
    renderWithProviders(<CommandMetadata command={baseCommand} />);

    expect(screen.getByText('echo "hello world"')).toBeInTheDocument();
    const pre = screen.getByText('echo "hello world"').closest('pre');
    expect(pre).toBeInTheDocument();
  });

  it('should render device name', () => {
    renderWithProviders(<CommandMetadata command={baseCommand} />);

    expect(screen.getByText('Test Server')).toBeInTheDocument();
    expect(screen.getByText('Device:')).toBeInTheDocument();
  });

  it('should render status badge', () => {
    renderWithProviders(<CommandMetadata command={baseCommand} />);

    expect(screen.getByText('Completed')).toBeInTheDocument();
  });

  it('should render submitted by', () => {
    renderWithProviders(<CommandMetadata command={baseCommand} />);

    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    expect(screen.getByText('Submitted by:')).toBeInTheDocument();
  });

  it('should render created timestamp', () => {
    renderWithProviders(<CommandMetadata command={baseCommand} />);

    expect(screen.getByText('Created:')).toBeInTheDocument();
  });

  it('should render started and completed timestamps when available', () => {
    renderWithProviders(<CommandMetadata command={baseCommand} />);

    expect(screen.getByText('Started:')).toBeInTheDocument();
    expect(screen.getByText('Completed:')).toBeInTheDocument();
  });

  it('should not render started timestamp when null', () => {
    const pendingCommand: GetCommandDetail = {
      ...baseCommand,
      status: 'pending',
      startedAt: null,
      completedAt: null,
    };

    renderWithProviders(<CommandMetadata command={pendingCommand} />);

    expect(screen.queryByText('Started:')).not.toBeInTheDocument();
    expect(screen.queryByText('Completed:')).not.toBeInTheDocument();
  });

  it('should render duration when command is completed', () => {
    renderWithProviders(<CommandMetadata command={baseCommand} />);

    expect(screen.getByText('Duration:')).toBeInTheDocument();
    expect(screen.getByText('30s')).toBeInTheDocument();
  });

  it('should not render duration when command is pending', () => {
    const pendingCommand: GetCommandDetail = {
      ...baseCommand,
      status: 'pending',
      startedAt: null,
      completedAt: null,
    };

    renderWithProviders(<CommandMetadata command={pendingCommand} />);

    expect(screen.queryByText('Duration:')).not.toBeInTheDocument();
  });

  it('should display duration in minutes and seconds for longer commands', () => {
    const longCommand: GetCommandDetail = {
      ...baseCommand,
      startedAt: '2025-12-28T10:00:00.000Z',
      completedAt: '2025-12-28T10:02:35.000Z',
    };

    renderWithProviders(<CommandMetadata command={longCommand} />);

    expect(screen.getByText('2m 35s')).toBeInTheDocument();
  });

  it('should display duration in milliseconds for sub-second commands', () => {
    const fastCommand: GetCommandDetail = {
      ...baseCommand,
      startedAt: '2025-12-28T10:00:00.000Z',
      completedAt: '2025-12-28T10:00:00.500Z',
    };

    renderWithProviders(<CommandMetadata command={fastCommand} />);

    expect(screen.getByText('500ms')).toBeInTheDocument();
  });
});
