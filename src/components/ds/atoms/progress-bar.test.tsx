import { render } from '@testing-library/react';
import { ProgressBar } from './progress-bar';

describe('ProgressBar', () => {
  describe('rendering', () => {
    it('renders with a value and default max', () => {
      const { container } = render(<ProgressBar value={50} />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it('renders with a custom max', () => {
      const { container } = render(<ProgressBar value={25} max={50} />);
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('clamps percentage to 100 when value exceeds max', () => {
      const { container } = render(<ProgressBar value={200} max={100} />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it('handles max of zero gracefully', () => {
      const { container } = render(<ProgressBar value={50} max={0} />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it('handles negative max gracefully', () => {
      const { container } = render(<ProgressBar value={50} max={-10} />);
      expect(container.firstChild).toBeInTheDocument();
    });
  });
});
