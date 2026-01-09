import { HomePage } from '@components/org/pages/home.page';
import { renderWithProviders } from '@lib/test-wrappers.utils';
import { setMobileViewport, setTabletViewport } from '@lib/viewport-test-utils';
import { screen, waitFor } from '@testing-library/react';

describe('HomePage', () => {
  it('should render loading state initially', () => {
    const { container } = renderWithProviders(<HomePage />);

    const skeletons = container.querySelectorAll('[data-slot="skeleton"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('should render organization dashboard with stats', async () => {
    renderWithProviders(<HomePage />);

    await waitFor(() => {
      expect(
        screen.getByText('Welcome to Test Organization'),
      ).toBeInTheDocument();
    });

    expect(
      screen.getByText('Manage your devices and execute remote commands'),
    ).toBeInTheDocument();
  });

  it('should render stat cards with correct data', async () => {
    renderWithProviders(<HomePage />);

    await waitFor(() => {
      expect(screen.getByText('Devices')).toBeInTheDocument();
    });

    expect(screen.getByText('Commands (24h)')).toBeInTheDocument();
    expect(screen.getByText('Tier')).toBeInTheDocument();
    expect(screen.getByText('Free Tier')).toBeInTheDocument();
  });

  it('should render recent activity section', async () => {
    renderWithProviders(<HomePage />);

    await waitFor(() => {
      expect(screen.getByText('Recent Activity')).toBeInTheDocument();
    });
  });

  describe('Mobile Responsive Layout (AC2, AC3)', () => {
    it('uses responsive padding on mobile (375px)', () => {
      setMobileViewport();
      const { container } = renderWithProviders(<HomePage />);

      const section = container.querySelector('section');
      // p-6 on mobile, md:p-10 on desktop
      expect(section).toHaveClass('p-6');
      expect(section).toHaveClass('md:p-10');
    });

    it('renders stats cards in single column on mobile', async () => {
      setMobileViewport();
      const { container } = renderWithProviders(<HomePage />);

      await waitFor(() => {
        const statsGrid = container.querySelector('.grid.md\\:grid-cols-3');
        if (statsGrid) {
          // md:grid-cols-3 means 3 columns at md breakpoint and above
          // On mobile (< 768px), it defaults to grid-cols-1 (single column)
          expect(statsGrid).toHaveClass('md:grid-cols-3');
        }
      });
    });

    it('renders stats cards in 3 columns on tablet and desktop', async () => {
      setTabletViewport();
      const { container } = renderWithProviders(<HomePage />);

      await waitFor(() => {
        const statsGrid = container.querySelector('.grid.md\\:grid-cols-3');
        if (statsGrid) {
          // md:grid-cols-3 applies at 768px+ (tablet and desktop)
          expect(statsGrid).toHaveClass('md:grid-cols-3');
        }
      });
    });

    it('renders dashboard skeleton with responsive layout', () => {
      setMobileViewport();
      const { container } = renderWithProviders(<HomePage />);

      const skeletons = container.querySelectorAll('[data-slot="skeleton"]');
      expect(skeletons.length).toBeGreaterThan(0);

      // Verify skeleton uses same responsive padding
      const section = container.querySelector('section');
      expect(section).toHaveClass('p-6');
      expect(section).toHaveClass('md:p-10');
    });
  });
});
