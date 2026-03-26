import { HiddenFileInput } from '@components/ds/atoms/hidden-file-input';
import { renderWithProviders } from '@lib/test-wrappers.utils';
import { screen } from '@testing-library/react';
import { createRef } from 'react';

describe('HiddenFileInput', () => {
  describe('rendering', () => {
    it('renders an input element', () => {
      renderWithProviders(<HiddenFileInput data-testid="file-input" />);
      expect(screen.getByTestId('file-input')).toBeInTheDocument();
    });

    it('renders with type="file"', () => {
      renderWithProviders(<HiddenFileInput data-testid="file-input" />);
      expect(screen.getByTestId('file-input')).toHaveAttribute('type', 'file');
    });
  });

  describe('ref forwarding', () => {
    it('forwards ref to the input element', () => {
      const ref = createRef<HTMLInputElement>();
      renderWithProviders(<HiddenFileInput ref={ref} />);
      expect(ref.current).toBeInstanceOf(HTMLInputElement);
    });
  });

  describe('additional props', () => {
    it('accepts accept prop', () => {
      renderWithProviders(
        <HiddenFileInput
          data-testid="file-input"
          accept="image/*"
        />,
      );
      expect(screen.getByTestId('file-input')).toHaveAttribute(
        'accept',
        'image/*',
      );
    });

    it('accepts multiple prop', () => {
      renderWithProviders(
        <HiddenFileInput
          data-testid="file-input"
          multiple
        />,
      );
      expect(screen.getByTestId('file-input')).toHaveAttribute('multiple');
    });
  });
});
