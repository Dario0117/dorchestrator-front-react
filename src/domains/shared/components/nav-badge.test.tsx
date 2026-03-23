import { NavBadge } from '@domains/shared/components/nav-badge';
import { renderWithProviders } from '@lib/test-wrappers.utils';
import { screen } from '@testing-library/react';

describe('NavBadge', () => {
  it('should render children text', () => {
    renderWithProviders(<NavBadge>5</NavBadge>);
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('should render string children', () => {
    renderWithProviders(<NavBadge>New</NavBadge>);
    expect(screen.getByText('New')).toBeInTheDocument();
  });

  it('should render complex children', () => {
    renderWithProviders(
      <NavBadge>
        <span data-testid="inner">content</span>
      </NavBadge>,
    );
    expect(screen.getByTestId('inner')).toBeInTheDocument();
    expect(screen.getByText('content')).toBeInTheDocument();
  });
});
