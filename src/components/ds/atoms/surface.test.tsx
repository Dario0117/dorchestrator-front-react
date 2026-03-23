import { render, screen } from '@testing-library/react';
import { Surface } from './surface';

describe('Surface', () => {
  describe('rendering', () => {
    it('renders children', () => {
      render(<Surface>content</Surface>);
      expect(screen.getByText('content')).toBeInTheDocument();
    });

    it('renders as a div element', () => {
      render(<Surface data-testid="surface">content</Surface>);
      expect(screen.getByTestId('surface').tagName).toBe('DIV');
    });
  });

  describe('visual props', () => {
    it('accepts bg', () => {
      render(<Surface bg="muted">text</Surface>);
      expect(screen.getByText('text')).toBeInTheDocument();
    });

    it('accepts border', () => {
      render(<Surface border="all">text</Surface>);
      expect(screen.getByText('text')).toBeInTheDocument();
    });

    it('accepts rounded', () => {
      render(<Surface rounded="md">text</Surface>);
      expect(screen.getByText('text')).toBeInTheDocument();
    });
  });

  describe('spacing props', () => {
    it('accepts margin props', () => {
      render(<Surface spaceAbove="md">text</Surface>);
      expect(screen.getByText('text')).toBeInTheDocument();
    });

    it('accepts padding props', () => {
      render(
        <Surface
          innerSpaceX="sm"
          innerSpaceY="md"
        >
          text
        </Surface>,
      );
      expect(screen.getByText('text')).toBeInTheDocument();
    });
  });

  describe('all spacing props', () => {
    it('accepts spaceBelow', () => {
      render(<Surface spaceBelow="md">text</Surface>);
      expect(screen.getByText('text')).toBeInTheDocument();
    });

    it('accepts spaceLeft', () => {
      render(<Surface spaceLeft="sm">text</Surface>);
      expect(screen.getByText('text')).toBeInTheDocument();
    });

    it('accepts spaceRight', () => {
      render(<Surface spaceRight="sm">text</Surface>);
      expect(screen.getByText('text')).toBeInTheDocument();
    });

    it('accepts spaceX', () => {
      render(<Surface spaceX="md">text</Surface>);
      expect(screen.getByText('text')).toBeInTheDocument();
    });

    it('accepts spaceY', () => {
      render(<Surface spaceY="md">text</Surface>);
      expect(screen.getByText('text')).toBeInTheDocument();
    });

    it('accepts innerSpaceAbove', () => {
      render(<Surface innerSpaceAbove="sm">text</Surface>);
      expect(screen.getByText('text')).toBeInTheDocument();
    });

    it('accepts innerSpaceBelow', () => {
      render(<Surface innerSpaceBelow="md">text</Surface>);
      expect(screen.getByText('text')).toBeInTheDocument();
    });

    it('accepts innerSpaceLeft', () => {
      render(<Surface innerSpaceLeft="sm">text</Surface>);
      expect(screen.getByText('text')).toBeInTheDocument();
    });

    it('accepts innerSpaceRight', () => {
      render(<Surface innerSpaceRight="sm">text</Surface>);
      expect(screen.getByText('text')).toBeInTheDocument();
    });
  });

  describe('sizing props', () => {
    it('accepts fullWidth', () => {
      render(<Surface fullWidth>text</Surface>);
      expect(screen.getByText('text')).toBeInTheDocument();
    });

    it('accepts fullHeight', () => {
      render(<Surface fullHeight>text</Surface>);
      expect(screen.getByText('text')).toBeInTheDocument();
    });

    it('accepts maxWidth', () => {
      render(<Surface maxWidth="md">text</Surface>);
      expect(screen.getByText('text')).toBeInTheDocument();
    });

    it('accepts grow', () => {
      render(<Surface grow>text</Surface>);
      expect(screen.getByText('text')).toBeInTheDocument();
    });

    it('accepts shrink={false}', () => {
      render(<Surface shrink={false}>text</Surface>);
      expect(screen.getByText('text')).toBeInTheDocument();
    });

    it('accepts minW0', () => {
      render(<Surface minW0>text</Surface>);
      expect(screen.getByText('text')).toBeInTheDocument();
    });
  });

  describe('combined props', () => {
    it('accepts visual and spacing props together', () => {
      render(
        <Surface
          bg="muted"
          border="all"
          rounded="md"
          innerSpaceX="sm"
          innerSpaceY="sm"
        >
          combined
        </Surface>,
      );
      expect(screen.getByText('combined')).toBeInTheDocument();
    });
  });

  describe('additional props', () => {
    it('spreads additional props to the element', () => {
      render(<Surface data-testid="surface">content</Surface>);
      expect(screen.getByTestId('surface')).toBeInTheDocument();
    });
  });
});
