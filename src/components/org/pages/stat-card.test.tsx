import { StatCard } from '@components/org/pages/stat-card';
import { renderWithProviders } from '@lib/test-wrappers.utils';
import { screen } from '@testing-library/react';
import { Monitor } from 'lucide-react';

describe('StatCard', () => {
  it('should render title and value', () => {
    renderWithProviders(
      <StatCard
        title="Devices"
        value={5}
        icon={Monitor}
      />,
    );

    expect(screen.getByText('Devices')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('should render string values', () => {
    renderWithProviders(
      <StatCard
        title="Tier"
        value="free"
        icon={Monitor}
      />,
    );

    expect(screen.getByText('Tier')).toBeInTheDocument();
    expect(screen.getByText('free')).toBeInTheDocument();
  });

  it('should render zero value', () => {
    renderWithProviders(
      <StatCard
        title="Commands"
        value={0}
        icon={Monitor}
      />,
    );

    expect(screen.getByText('Commands')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument();
  });
});
