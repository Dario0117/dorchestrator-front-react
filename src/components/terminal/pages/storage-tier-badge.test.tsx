import { StorageTierBadge } from '@components/terminal/pages/storage-tier-badge';
import { renderWithProviders } from '@lib/test-wrappers.utils';
import { screen } from '@testing-library/react';

describe('StorageTierBadge', () => {
  it.each(['hot', 'cold', 'restoring'] as const)(
    'should render %s tier',
    (tier) => {
      renderWithProviders(<StorageTierBadge tier={tier} />);
      expect(screen.getByText(tier)).toBeInTheDocument();
    },
  );

  it('should render "unknown" when tier is null', () => {
    renderWithProviders(<StorageTierBadge tier={null} />);
    expect(screen.getByText('unknown')).toBeInTheDocument();
  });

  it('should render unknown tier with fallback style', () => {
    renderWithProviders(<StorageTierBadge tier="some-other-tier" />);
    expect(screen.getByText('some-other-tier')).toBeInTheDocument();
  });
});
