import { FileThumbOverlay } from '@components/ds/atoms/file-thumb-overlay';
import { renderWithProviders } from '@lib/test-wrappers.utils';
import { screen } from '@testing-library/react';

describe('FileThumbOverlay', () => {
  describe('rendering', () => {
    it('renders children', () => {
      renderWithProviders(<FileThumbOverlay>file.png</FileThumbOverlay>);
      expect(screen.getByText('file.png')).toBeInTheDocument();
    });

    it('renders as a div element', () => {
      renderWithProviders(
        <FileThumbOverlay data-testid="overlay">file.png</FileThumbOverlay>,
      );
      expect(screen.getByTestId('overlay').tagName).toBe('DIV');
    });
  });

  describe('additional props', () => {
    it('spreads additional props to the element', () => {
      renderWithProviders(
        <FileThumbOverlay
          data-testid="overlay"
          aria-label="thumbnail"
        >
          file.png
        </FileThumbOverlay>,
      );
      expect(screen.getByTestId('overlay')).toHaveAttribute(
        'aria-label',
        'thumbnail',
      );
    });
  });
});
