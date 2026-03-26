import { BookmarkStatusBadge } from '@domains/terminal/components/bookmark-status-badge';
import { TERMINAL_SESSION_STATUSES } from '@domains/terminal/services/list-terminal-sessions.http-service.constants';
import { renderWithProviders } from '@lib/test-wrappers.utils';
import { screen } from '@testing-library/react';

describe('BookmarkStatusBadge', () => {
  it.each(TERMINAL_SESSION_STATUSES)('should render %s status', (status) => {
    renderWithProviders(<BookmarkStatusBadge status={status} />);
    expect(screen.getByText(status)).toBeInTheDocument();
  });

  it('should render unknown status with fallback style', () => {
    renderWithProviders(<BookmarkStatusBadge status="unknown-status" />);
    expect(screen.getByText('unknown-status')).toBeInTheDocument();
  });
});
