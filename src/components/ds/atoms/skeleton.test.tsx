import { Skeleton } from '@components/ds/atoms/skeleton';
import { render, screen } from '@testing-library/react';

describe('Skeleton', () => {
  it('renders with the skeleton data-slot', () => {
    render(<Skeleton data-testid="skeleton" />);

    expect(screen.getByTestId('skeleton')).toBeInTheDocument();
  });

  it('passes through non-className props', () => {
    render(
      <Skeleton
        data-testid="skeleton"
        aria-label="Loading"
      />,
    );

    expect(screen.getByTestId('skeleton')).toHaveAttribute(
      'aria-label',
      'Loading',
    );
  });

  it('renders children', () => {
    render(<Skeleton>Loading content</Skeleton>);

    expect(screen.getByText('Loading content')).toBeInTheDocument();
  });
});
