import { BlurOverlay } from '@components/ds/atoms/blur-overlay';
import { renderWithProviders } from '@lib/test-wrappers.utils';

describe('BlurOverlay', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<BlurOverlay />);
    expect(container.firstChild).toBeInTheDocument();
  });

  describe('bg prop', () => {
    it('defaults to muted/30 background', () => {
      const { container } = renderWithProviders(<BlurOverlay />);
      expect(container.firstChild).toHaveClass('bg-muted/30');
    });

    it('applies muted/50 background', () => {
      const { container } = renderWithProviders(<BlurOverlay bg="muted/50" />);
      expect(container.firstChild).toHaveClass('bg-muted/50');
    });

    it('applies muted background', () => {
      const { container } = renderWithProviders(<BlurOverlay bg="muted" />);
      expect(container.firstChild).toHaveClass('bg-muted');
    });
  });
});
