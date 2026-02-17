import { CommandOutput } from '@components/commands/command-output';
import { renderWithProviders } from '@lib/test-wrappers.utils';
import type { GetCommandDetail } from '@services/commands/get-command.http-service';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

type CommandResults = GetCommandDetail['results'];

const resultsWithStdout: CommandResults = [
  {
    id: 1,
    stdout: 'hello world\n',
    stderr: null,
    exitCode: 0,
    createdAt: '2025-12-28T10:01:30.000Z',
  },
];

const resultsWithStderr: CommandResults = [
  {
    id: 1,
    stdout: 'partial output',
    stderr: 'error: something went wrong\n',
    exitCode: 1,
    createdAt: '2025-12-28T10:01:30.000Z',
  },
];

describe('CommandOutput', () => {
  it('should render stdout section when stdout is present', () => {
    renderWithProviders(<CommandOutput results={resultsWithStdout} />);

    expect(screen.getByText('Standard Output (stdout)')).toBeInTheDocument();
    expect(screen.getByText(/hello world/)).toBeInTheDocument();
  });

  it('should not render stderr section when stderr is null', () => {
    renderWithProviders(<CommandOutput results={resultsWithStdout} />);

    expect(
      screen.queryByText('Standard Error (stderr)'),
    ).not.toBeInTheDocument();
  });

  it('should render both stdout and stderr when present', () => {
    renderWithProviders(<CommandOutput results={resultsWithStderr} />);

    expect(screen.getByText('Standard Output (stdout)')).toBeInTheDocument();
    expect(screen.getByText('Standard Error (stderr)')).toBeInTheDocument();
  });

  it('should display exit code 0 with green styling', () => {
    renderWithProviders(<CommandOutput results={resultsWithStdout} />);

    const badge = screen.getByText('Exit code: 0');
    expect(badge).toBeInTheDocument();
  });

  it('should display non-zero exit code with red styling', () => {
    renderWithProviders(<CommandOutput results={resultsWithStderr} />);

    const badge = screen.getByText('Exit code: 1');
    expect(badge).toBeInTheDocument();
  });

  it('should render nothing when results array is empty', () => {
    const { container } = renderWithProviders(<CommandOutput results={[]} />);

    expect(container.firstChild).toBeNull();
  });

  it('should toggle stdout section when clicking trigger', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CommandOutput results={resultsWithStdout} />);

    const trigger = screen.getByText('Standard Output (stdout)');
    expect(screen.getByText(/hello world/)).toBeInTheDocument();

    await user.click(trigger);

    expect(screen.queryByText(/hello world/)).not.toBeInTheDocument();
  });

  it('should render execution results card title', () => {
    renderWithProviders(<CommandOutput results={resultsWithStdout} />);

    expect(screen.getByText('Execution Results')).toBeInTheDocument();
  });
});
