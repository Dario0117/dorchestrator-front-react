import { StorageTierBadge } from '@domains/terminal/components/storage-tier-badge';
import { RECORDING_STORAGE_TIER } from '@domains/terminal/services/get-recording.http-service.constants';
import { renderWithProviders } from '@lib/test-wrappers.utils';
import { screen } from '@testing-library/react';

const ALL_TIERS = Object.values(RECORDING_STORAGE_TIER);

describe('StorageTierBadge', () => {
  it.each(ALL_TIERS)('should render %s tier', (tier) => {
    renderWithProviders(<StorageTierBadge tier={tier} />);
    expect(screen.getByText(tier)).toBeInTheDocument();
  });

  it('should render "unknown" when tier is null', () => {
    renderWithProviders(<StorageTierBadge tier={null} />);
    expect(screen.getByText('unknown')).toBeInTheDocument();
  });

  it('should render unknown tier with fallback style', () => {
    renderWithProviders(<StorageTierBadge tier={null} />);
    expect(screen.getByText('unknown')).toBeInTheDocument();
  });
});
