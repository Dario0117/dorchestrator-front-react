import { CommandStatusBadge } from '@components/commands/command-status-badge';
import { render, screen } from '@testing-library/react';

describe('CommandStatusBadge', () => {
  it('should render "Pending" for pending status', () => {
    render(<CommandStatusBadge status="pending" />);
    expect(screen.getByText('Pending')).toBeInTheDocument();
  });

  it('should render "Running" for running status', () => {
    render(<CommandStatusBadge status="running" />);
    expect(screen.getByText('Running')).toBeInTheDocument();
  });

  it('should render "Completed" for completed status', () => {
    render(<CommandStatusBadge status="completed" />);
    expect(screen.getByText('Completed')).toBeInTheDocument();
  });

  it('should render "Failed" for failed status', () => {
    render(<CommandStatusBadge status="failed" />);
    expect(screen.getByText('Failed')).toBeInTheDocument();
  });

  it('should render raw status for unknown status', () => {
    render(<CommandStatusBadge status="unknown-status" />);
    expect(screen.getByText('unknown-status')).toBeInTheDocument();
  });
});
