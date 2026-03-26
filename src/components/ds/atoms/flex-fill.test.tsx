import { FlexFill } from '@components/ds/atoms/flex-fill';
import { renderWithProviders } from '@lib/test-wrappers.utils';
import { screen } from '@testing-library/react';

describe('FlexFill', () => {
  describe('rendering', () => {
    it('renders children', () => {
      renderWithProviders(<FlexFill>Fill content</FlexFill>);
      expect(screen.getByText('Fill content')).toBeInTheDocument();
    });

    it('renders as a div element', () => {
      renderWithProviders(<FlexFill data-testid="fill">Content</FlexFill>);
      expect(screen.getByTestId('fill').tagName).toBe('DIV');
    });
  });

  describe('additional props', () => {
    it('spreads additional props to the element', () => {
      renderWithProviders(
        <FlexFill
          data-testid="fill"
          aria-label="fill area"
        >
          Content
        </FlexFill>,
      );
      expect(screen.getByTestId('fill')).toHaveAttribute(
        'aria-label',
        'fill area',
      );
    });
  });
});
