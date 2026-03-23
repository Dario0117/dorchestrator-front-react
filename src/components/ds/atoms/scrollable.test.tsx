import { render, screen } from '@testing-library/react';
import { Scrollable } from './scrollable';

describe('Scrollable', () => {
  describe('rendering', () => {
    it('renders children', () => {
      render(<Scrollable>content</Scrollable>);
      expect(screen.getByText('content')).toBeInTheDocument();
    });

    it('renders as a div element', () => {
      render(<Scrollable data-testid="scrollable">content</Scrollable>);
      expect(screen.getByTestId('scrollable').tagName).toBe('DIV');
    });
  });

  describe('overflow props', () => {
    it('accepts overflow', () => {
      render(<Scrollable overflow="auto">text</Scrollable>);
      expect(screen.getByText('text')).toBeInTheDocument();
    });

    it('accepts overflowY', () => {
      render(<Scrollable overflowY="auto">text</Scrollable>);
      expect(screen.getByText('text')).toBeInTheDocument();
    });

    it('accepts maxH', () => {
      render(<Scrollable maxH="sm">text</Scrollable>);
      expect(screen.getByText('text')).toBeInTheDocument();
    });

    it('accepts minH', () => {
      render(<Scrollable minH="md">text</Scrollable>);
      expect(screen.getByText('text')).toBeInTheDocument();
    });
  });

  describe('spacing props', () => {
    it('accepts margin props', () => {
      render(<Scrollable spaceAbove="md">text</Scrollable>);
      expect(screen.getByText('text')).toBeInTheDocument();
    });

    it('accepts padding props', () => {
      render(
        <Scrollable
          innerSpaceX="sm"
          innerSpaceY="md"
        >
          text
        </Scrollable>,
      );
      expect(screen.getByText('text')).toBeInTheDocument();
    });
  });

  describe('maxH and minH variants', () => {
    it('accepts maxH="xs"', () => {
      render(<Scrollable maxH="xs">text</Scrollable>);
      expect(screen.getByText('text')).toBeInTheDocument();
    });

    it('accepts maxH="lg"', () => {
      render(<Scrollable maxH="lg">text</Scrollable>);
      expect(screen.getByText('text')).toBeInTheDocument();
    });

    it('accepts minH="sm"', () => {
      render(<Scrollable minH="sm">text</Scrollable>);
      expect(screen.getByText('text')).toBeInTheDocument();
    });

    it('accepts minH="lg"', () => {
      render(<Scrollable minH="lg">text</Scrollable>);
      expect(screen.getByText('text')).toBeInTheDocument();
    });
  });

  describe('all spacing props', () => {
    it('accepts spaceBelow', () => {
      render(<Scrollable spaceBelow="md">text</Scrollable>);
      expect(screen.getByText('text')).toBeInTheDocument();
    });

    it('accepts spaceLeft', () => {
      render(<Scrollable spaceLeft="sm">text</Scrollable>);
      expect(screen.getByText('text')).toBeInTheDocument();
    });

    it('accepts spaceRight', () => {
      render(<Scrollable spaceRight="sm">text</Scrollable>);
      expect(screen.getByText('text')).toBeInTheDocument();
    });

    it('accepts spaceX', () => {
      render(<Scrollable spaceX="md">text</Scrollable>);
      expect(screen.getByText('text')).toBeInTheDocument();
    });

    it('accepts spaceY', () => {
      render(<Scrollable spaceY="md">text</Scrollable>);
      expect(screen.getByText('text')).toBeInTheDocument();
    });

    it('accepts innerSpaceAbove', () => {
      render(<Scrollable innerSpaceAbove="sm">text</Scrollable>);
      expect(screen.getByText('text')).toBeInTheDocument();
    });

    it('accepts innerSpaceBelow', () => {
      render(<Scrollable innerSpaceBelow="md">text</Scrollable>);
      expect(screen.getByText('text')).toBeInTheDocument();
    });

    it('accepts innerSpaceLeft', () => {
      render(<Scrollable innerSpaceLeft="sm">text</Scrollable>);
      expect(screen.getByText('text')).toBeInTheDocument();
    });

    it('accepts innerSpaceRight', () => {
      render(<Scrollable innerSpaceRight="sm">text</Scrollable>);
      expect(screen.getByText('text')).toBeInTheDocument();
    });
  });

  describe('sizing props', () => {
    it('accepts fullWidth', () => {
      render(<Scrollable fullWidth>text</Scrollable>);
      expect(screen.getByText('text')).toBeInTheDocument();
    });

    it('accepts fullHeight', () => {
      render(<Scrollable fullHeight>text</Scrollable>);
      expect(screen.getByText('text')).toBeInTheDocument();
    });

    it('accepts maxWidth', () => {
      render(<Scrollable maxWidth="md">text</Scrollable>);
      expect(screen.getByText('text')).toBeInTheDocument();
    });

    it('accepts grow', () => {
      render(<Scrollable grow>text</Scrollable>);
      expect(screen.getByText('text')).toBeInTheDocument();
    });

    it('accepts shrink={false}', () => {
      render(<Scrollable shrink={false}>text</Scrollable>);
      expect(screen.getByText('text')).toBeInTheDocument();
    });

    it('accepts minW0', () => {
      render(<Scrollable minW0>text</Scrollable>);
      expect(screen.getByText('text')).toBeInTheDocument();
    });
  });

  describe('combined props', () => {
    it('accepts overflow and spacing props together', () => {
      render(
        <Scrollable
          overflowY="auto"
          maxH="sm"
          innerSpaceX="sm"
        >
          combined
        </Scrollable>,
      );
      expect(screen.getByText('combined')).toBeInTheDocument();
    });
  });

  describe('additional props', () => {
    it('spreads additional props to the element', () => {
      render(<Scrollable data-testid="scrollable">content</Scrollable>);
      expect(screen.getByTestId('scrollable')).toBeInTheDocument();
    });
  });
});
