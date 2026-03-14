import { BookmarksTableSkeleton } from '@components/terminal/pages/bookmarks-table-skeleton';
import { renderWithProviders } from '@lib/test-wrappers.utils';
import { screen } from '@testing-library/react';

describe('BookmarksTableSkeleton', () => {
  it('should render column headers', () => {
    renderWithProviders(<BookmarksTableSkeleton />);

    expect(screen.getByText('Device')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Session Created')).toBeInTheDocument();
    expect(screen.getByText('Bookmarked')).toBeInTheDocument();
    expect(screen.getByText('Note')).toBeInTheDocument();
    expect(screen.getByText('Recording')).toBeInTheDocument();
  });

  it('should render 5 skeleton rows', () => {
    const { container } = renderWithProviders(<BookmarksTableSkeleton />);

    const rows = container.querySelectorAll('tbody tr');
    expect(rows).toHaveLength(5);
  });
});
