import { SessionLoadingSkeleton } from '@domains/terminal/components/session-loading-skeleton';
import { renderWithProviders } from '@lib/test-wrappers.utils';

describe('SessionLoadingSkeleton', () => {
  it('should render loading skeleton elements', () => {
    const { container } = renderWithProviders(<SessionLoadingSkeleton />);

    const skeletons = container.querySelectorAll('[data-slot="skeleton"]');
    expect(skeletons.length).toBeGreaterThanOrEqual(2);
  });
});
