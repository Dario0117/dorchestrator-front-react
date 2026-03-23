import { SessionStatusBadge } from '@domains/terminal/components/session-status-badge';
import { renderWithProviders } from '@lib/test-wrappers.utils';
import { screen } from '@testing-library/react';

describe('SessionStatusBadge', () => {
  it('should render the status text', () => {
    renderWithProviders(<SessionStatusBadge status="active" />);
    expect(screen.getByText('active')).toBeInTheDocument();
  });

  it('should render as a badge with outline variant', () => {
    renderWithProviders(<SessionStatusBadge status="terminated" />);
    expect(screen.getByText('terminated')).toBeInTheDocument();
  });

  it.each(['active', 'created', 'locked', 'terminated'] as const)(
    'should render %s status',
    (status) => {
      renderWithProviders(<SessionStatusBadge status={status} />);
      expect(screen.getByText(status)).toBeInTheDocument();
    },
  );
});
