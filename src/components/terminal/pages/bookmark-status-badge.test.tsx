import { BookmarkStatusBadge } from '@components/terminal/pages/bookmark-status-badge';
import { renderWithProviders } from '@lib/test-wrappers.utils';
import { screen } from '@testing-library/react';

describe('BookmarkStatusBadge', () => {
  it.each(['active', 'created', 'locked', 'terminated'])(
    'should render %s status',
    (status) => {
      renderWithProviders(<BookmarkStatusBadge status={status} />);
      expect(screen.getByText(status)).toBeInTheDocument();
    },
  );

  it('should render unknown status with fallback style', () => {
    renderWithProviders(<BookmarkStatusBadge status="unknown-status" />);
    expect(screen.getByText('unknown-status')).toBeInTheDocument();
  });
});
