import { ActivityBadge } from '@components/ds/atoms/activity-badge';
import { renderWithProviders } from '@lib/test-wrappers.utils';
import { screen } from '@testing-library/react';

describe('ActivityBadge', () => {
  it('should render nothing when count is 0', () => {
    const { container } = renderWithProviders(<ActivityBadge count={0} />);
    expect(container.firstChild).toBeNull();
  });

  it('should render nothing when count is negative', () => {
    const { container } = renderWithProviders(<ActivityBadge count={-1} />);
    expect(container.firstChild).toBeNull();
  });

  it('should render count text when count is greater than 0', () => {
    renderWithProviders(<ActivityBadge count={3} />);
    expect(screen.getByText('3 active')).toBeInTheDocument();
  });

  it('should have correct aria-label with plural for multiple tasks', () => {
    renderWithProviders(<ActivityBadge count={5} />);
    expect(screen.getByLabelText('5 active tasks')).toBeInTheDocument();
  });

  it('should have correct aria-label with singular for one task', () => {
    renderWithProviders(<ActivityBadge count={1} />);
    expect(screen.getByLabelText('1 active task')).toBeInTheDocument();
  });
});
