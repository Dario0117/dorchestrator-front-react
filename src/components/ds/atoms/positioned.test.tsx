import { render, screen } from '@testing-library/react';
import { Positioned } from './positioned';

describe('Positioned', () => {
  describe('rendering', () => {
    it('renders children', () => {
      render(<Positioned>content</Positioned>);
      expect(screen.getByText('content')).toBeInTheDocument();
    });

    it('renders as a div element', () => {
      render(<Positioned data-testid="positioned">content</Positioned>);
      expect(screen.getByTestId('positioned').tagName).toBe('DIV');
    });
  });

  describe('position props', () => {
    it('accepts position relative', () => {
      render(<Positioned position="relative">text</Positioned>);
      expect(screen.getByText('text')).toBeInTheDocument();
    });

    it('accepts position absolute', () => {
      render(<Positioned position="absolute">text</Positioned>);
      expect(screen.getByText('text')).toBeInTheDocument();
    });

    it('accepts inset0', () => {
      render(<Positioned inset0>text</Positioned>);
      expect(screen.getByText('text')).toBeInTheDocument();
    });

    it('accepts insetTopRight', () => {
      render(<Positioned insetTopRight>text</Positioned>);
      expect(screen.getByText('text')).toBeInTheDocument();
    });

    it('accepts insetYCenter', () => {
      render(<Positioned insetYCenter>text</Positioned>);
      expect(screen.getByText('text')).toBeInTheDocument();
    });

    it('accepts insetRight', () => {
      render(<Positioned insetRight="sm">text</Positioned>);
      expect(screen.getByText('text')).toBeInTheDocument();
    });

    it('accepts zIndex', () => {
      render(<Positioned zIndex="behind">text</Positioned>);
      expect(screen.getByText('text')).toBeInTheDocument();
    });

    it('accepts showOnGroupHover', () => {
      render(<Positioned showOnGroupHover>text</Positioned>);
      expect(screen.getByText('text')).toBeInTheDocument();
    });
  });

  describe('spacing props', () => {
    it('accepts spaceAbove', () => {
      render(<Positioned spaceAbove="md">text</Positioned>);
      expect(screen.getByText('text')).toBeInTheDocument();
    });

    it('accepts spaceBelow', () => {
      render(<Positioned spaceBelow="md">text</Positioned>);
      expect(screen.getByText('text')).toBeInTheDocument();
    });

    it('accepts spaceLeft', () => {
      render(<Positioned spaceLeft="sm">text</Positioned>);
      expect(screen.getByText('text')).toBeInTheDocument();
    });

    it('accepts spaceRight', () => {
      render(<Positioned spaceRight="sm">text</Positioned>);
      expect(screen.getByText('text')).toBeInTheDocument();
    });

    it('accepts spaceX', () => {
      render(<Positioned spaceX="md">text</Positioned>);
      expect(screen.getByText('text')).toBeInTheDocument();
    });

    it('accepts spaceY', () => {
      render(<Positioned spaceY="md">text</Positioned>);
      expect(screen.getByText('text')).toBeInTheDocument();
    });

    it('accepts innerSpaceAbove', () => {
      render(<Positioned innerSpaceAbove="sm">text</Positioned>);
      expect(screen.getByText('text')).toBeInTheDocument();
    });

    it('accepts innerSpaceBelow', () => {
      render(<Positioned innerSpaceBelow="md">text</Positioned>);
      expect(screen.getByText('text')).toBeInTheDocument();
    });

    it('accepts innerSpaceLeft', () => {
      render(<Positioned innerSpaceLeft="sm">text</Positioned>);
      expect(screen.getByText('text')).toBeInTheDocument();
    });

    it('accepts innerSpaceRight', () => {
      render(<Positioned innerSpaceRight="sm">text</Positioned>);
      expect(screen.getByText('text')).toBeInTheDocument();
    });

    it('accepts innerSpaceX', () => {
      render(<Positioned innerSpaceX="sm">text</Positioned>);
      expect(screen.getByText('text')).toBeInTheDocument();
    });

    it('accepts innerSpaceY', () => {
      render(<Positioned innerSpaceY="md">text</Positioned>);
      expect(screen.getByText('text')).toBeInTheDocument();
    });
  });

  describe('sizing props', () => {
    it('accepts fullWidth', () => {
      render(<Positioned fullWidth>text</Positioned>);
      expect(screen.getByText('text')).toBeInTheDocument();
    });

    it('accepts fullHeight', () => {
      render(<Positioned fullHeight>text</Positioned>);
      expect(screen.getByText('text')).toBeInTheDocument();
    });

    it('accepts maxWidth', () => {
      render(<Positioned maxWidth="md">text</Positioned>);
      expect(screen.getByText('text')).toBeInTheDocument();
    });

    it('accepts grow', () => {
      render(<Positioned grow>text</Positioned>);
      expect(screen.getByText('text')).toBeInTheDocument();
    });

    it('accepts shrink={false}', () => {
      render(<Positioned shrink={false}>text</Positioned>);
      expect(screen.getByText('text')).toBeInTheDocument();
    });

    it('accepts minW0', () => {
      render(<Positioned minW0>text</Positioned>);
      expect(screen.getByText('text')).toBeInTheDocument();
    });
  });

  describe('combined props', () => {
    it('accepts position and spacing props together', () => {
      render(
        <Positioned
          position="absolute"
          insetTopRight
          showOnGroupHover
        >
          combined
        </Positioned>,
      );
      expect(screen.getByText('combined')).toBeInTheDocument();
    });
  });

  describe('additional props', () => {
    it('spreads additional props to the element', () => {
      render(<Positioned data-testid="positioned">content</Positioned>);
      expect(screen.getByTestId('positioned')).toBeInTheDocument();
    });
  });
});
