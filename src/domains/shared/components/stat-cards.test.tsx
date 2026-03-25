import { StatCards } from '@domains/shared/components/stat-cards';
import { renderWithProviders } from '@lib/test-wrappers.utils';
import { screen } from '@testing-library/react';

describe('StatCards', () => {
  it('should render all three stat cards with data', () => {
    renderWithProviders(
      <StatCards
        devicesOnline={3}
        devicesTotal={5}
        commandsIn24h={12}
        activeSessions={2}
      />,
    );

    expect(screen.getByText('Devices Online')).toBeInTheDocument();
    expect(screen.getByText('3/5')).toBeInTheDocument();
    expect(screen.getByText('Commands (24h)')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('Active Sessions')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('should render zero values correctly', () => {
    renderWithProviders(
      <StatCards
        devicesOnline={0}
        devicesTotal={0}
        commandsIn24h={0}
        activeSessions={0}
      />,
    );

    expect(screen.getByText('0/0')).toBeInTheDocument();
    const zeros = screen.getAllByText('0');
    expect(zeros.length).toBeGreaterThanOrEqual(2);
  });

  it('should render loading skeleton when isLoading is true', () => {
    const { container } = renderWithProviders(
      <StatCards
        devicesOnline={3}
        devicesTotal={5}
        commandsIn24h={12}
        activeSessions={2}
        isLoading
      />,
    );

    expect(screen.queryByText('Devices Online')).not.toBeInTheDocument();
    expect(screen.queryByText('3/5')).not.toBeInTheDocument();

    // Skeleton elements should be present
    const skeletons = container.querySelectorAll('[data-slot="skeleton"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });
});
