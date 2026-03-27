import { render } from '@testing-library/react';
import { StatCardSkeleton } from './stat-cards.skeleton';

describe('StatCardSkeleton', () => {
  it('renders without crashing', () => {
    const { container } = render(<StatCardSkeleton />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders skeleton elements for loading state', () => {
    const { container } = render(<StatCardSkeleton />);
    const skeletons = container.querySelectorAll('[data-slot="skeleton"]');
    expect(skeletons.length).toBeGreaterThanOrEqual(2);
  });
});
