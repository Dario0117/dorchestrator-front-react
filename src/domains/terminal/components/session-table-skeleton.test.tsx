import { SessionTableSkeleton } from '@domains/terminal/components/session-table-skeleton';
import { renderWithProviders } from '@lib/test-wrappers.utils';
import { screen } from '@testing-library/react';

describe('SessionTableSkeleton', () => {
  it('should render column headers', () => {
    renderWithProviders(<SessionTableSkeleton />);

    expect(screen.getByText('User')).toBeInTheDocument();
    expect(screen.getByText('Device')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Created')).toBeInTheDocument();
    expect(screen.getByText('Last Activity')).toBeInTheDocument();
    expect(screen.getByText('Terminated')).toBeInTheDocument();
    expect(screen.getByText('Duration')).toBeInTheDocument();
    expect(screen.getByText('Recording')).toBeInTheDocument();
  });

  it('should render 5 skeleton rows', () => {
    const { container } = renderWithProviders(<SessionTableSkeleton />);

    const rows = container.querySelectorAll('tbody tr');
    expect(rows).toHaveLength(5);
  });
});
