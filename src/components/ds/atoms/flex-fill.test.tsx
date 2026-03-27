import { FlexFill } from '@components/ds/atoms/flex-fill';
import { renderWithProviders } from '@lib/test-wrappers.utils';
import { screen } from '@testing-library/react';

describe('FlexFill', () => {
  it('renders children', () => {
    renderWithProviders(<FlexFill>Fill content</FlexFill>);
    expect(screen.getByText('Fill content')).toBeInTheDocument();
  });

  describe('spacing props', () => {
    it('applies spaceAbove', () => {
      renderWithProviders(
        <FlexFill
          data-testid="fill"
          spaceAbove="md"
        >
          Content
        </FlexFill>,
      );
      expect(screen.getByTestId('fill')).toHaveClass('mt-4');
    });

    it('applies spaceBelow', () => {
      renderWithProviders(
        <FlexFill
          data-testid="fill"
          spaceBelow="sm"
        >
          Content
        </FlexFill>,
      );
      expect(screen.getByTestId('fill')).toHaveClass('mb-2');
    });

    it('applies spaceLeft', () => {
      renderWithProviders(
        <FlexFill
          data-testid="fill"
          spaceLeft="md"
        >
          Content
        </FlexFill>,
      );
      expect(screen.getByTestId('fill')).toHaveClass('ml-4');
    });

    it('applies spaceRight', () => {
      renderWithProviders(
        <FlexFill
          data-testid="fill"
          spaceRight="sm"
        >
          Content
        </FlexFill>,
      );
      expect(screen.getByTestId('fill')).toHaveClass('mr-2');
    });

    it('applies spaceX', () => {
      renderWithProviders(
        <FlexFill
          data-testid="fill"
          spaceX="lg"
        >
          Content
        </FlexFill>,
      );
      expect(screen.getByTestId('fill')).toHaveClass('mx-6');
    });

    it('applies spaceY', () => {
      renderWithProviders(
        <FlexFill
          data-testid="fill"
          spaceY="md"
        >
          Content
        </FlexFill>,
      );
      expect(screen.getByTestId('fill')).toHaveClass('my-4');
    });

    it('applies innerSpaceAbove', () => {
      renderWithProviders(
        <FlexFill
          data-testid="fill"
          innerSpaceAbove="sm"
        >
          Content
        </FlexFill>,
      );
      expect(screen.getByTestId('fill')).toHaveClass('pt-2');
    });

    it('applies innerSpaceBelow', () => {
      renderWithProviders(
        <FlexFill
          data-testid="fill"
          innerSpaceBelow="lg"
        >
          Content
        </FlexFill>,
      );
      expect(screen.getByTestId('fill')).toHaveClass('pb-6');
    });

    it('applies innerSpaceLeft', () => {
      renderWithProviders(
        <FlexFill
          data-testid="fill"
          innerSpaceLeft="sm"
        >
          Content
        </FlexFill>,
      );
      expect(screen.getByTestId('fill')).toHaveClass('pl-2');
    });

    it('applies innerSpaceRight', () => {
      renderWithProviders(
        <FlexFill
          data-testid="fill"
          innerSpaceRight="md"
        >
          Content
        </FlexFill>,
      );
      expect(screen.getByTestId('fill')).toHaveClass('pr-4');
    });

    it('applies innerSpaceX', () => {
      renderWithProviders(
        <FlexFill
          data-testid="fill"
          innerSpaceX="md"
        >
          Content
        </FlexFill>,
      );
      expect(screen.getByTestId('fill')).toHaveClass('px-4');
    });

    it('applies innerSpaceY', () => {
      renderWithProviders(
        <FlexFill
          data-testid="fill"
          innerSpaceY="xl"
        >
          Content
        </FlexFill>,
      );
      expect(screen.getByTestId('fill')).toHaveClass('py-8');
    });
  });

  describe('sizing props', () => {
    it('applies fullWidth', () => {
      renderWithProviders(
        <FlexFill
          data-testid="fill"
          fullWidth
        >
          Content
        </FlexFill>,
      );
      expect(screen.getByTestId('fill')).toHaveClass('w-full');
    });

    it('applies fullHeight', () => {
      renderWithProviders(
        <FlexFill
          data-testid="fill"
          fullHeight
        >
          Content
        </FlexFill>,
      );
      expect(screen.getByTestId('fill')).toHaveClass('h-full');
    });

    it('applies maxWidth', () => {
      renderWithProviders(
        <FlexFill
          data-testid="fill"
          maxWidth="lg"
        >
          Content
        </FlexFill>,
      );
      expect(screen.getByTestId('fill')).toHaveClass('max-w-lg');
    });
  });

  describe('shrink', () => {
    it('applies shrink-0 when shrink is false', () => {
      renderWithProviders(
        <FlexFill
          data-testid="fill"
          shrink={false}
        >
          Content
        </FlexFill>,
      );
      expect(screen.getByTestId('fill')).toHaveClass('shrink-0');
    });

    it('does not apply shrink-0 by default', () => {
      renderWithProviders(<FlexFill data-testid="fill">Content</FlexFill>);
      expect(screen.getByTestId('fill')).not.toHaveClass('shrink-0');
    });
  });

  it('spreads additional props', () => {
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
