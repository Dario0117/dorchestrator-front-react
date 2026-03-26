import { BlurOverlay } from '@components/ds/atoms/blur-overlay';
import { renderWithProviders } from '@lib/test-wrappers.utils';

describe('BlurOverlay', () => {
  describe('rendering', () => {
    it('renders without crashing', () => {
      const { container } = renderWithProviders(<BlurOverlay />);
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('semantic props', () => {
    it('accepts bg prop', () => {
      const { container } = renderWithProviders(<BlurOverlay bg="muted/50" />);
      expect(container.firstChild).toBeInTheDocument();
    });
  });
});
