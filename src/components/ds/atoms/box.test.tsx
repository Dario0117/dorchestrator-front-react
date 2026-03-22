import { render, screen } from '@testing-library/react';
import { Box } from './box';

describe('Box', () => {
  describe('rendering', () => {
    it('renders children', () => {
      render(<Box>content</Box>);
      expect(screen.getByText('content')).toBeInTheDocument();
    });

    it('renders as a div element', () => {
      render(<Box data-testid="box">content</Box>);
      expect(screen.getByTestId('box').tagName).toBe('DIV');
    });
  });

  describe('margin props', () => {
    it('accepts spaceAbove', () => {
      render(<Box spaceAbove="md">text</Box>);
      expect(screen.getByText('text')).toBeInTheDocument();
    });

    it('accepts spaceBelow', () => {
      render(<Box spaceBelow="lg">text</Box>);
      expect(screen.getByText('text')).toBeInTheDocument();
    });

    it('accepts spaceLeft', () => {
      render(<Box spaceLeft="sm">text</Box>);
      expect(screen.getByText('text')).toBeInTheDocument();
    });

    it('accepts spaceRight', () => {
      render(<Box spaceRight="xs">text</Box>);
      expect(screen.getByText('text')).toBeInTheDocument();
    });

    it('accepts spaceX', () => {
      render(<Box spaceX="md">text</Box>);
      expect(screen.getByText('text')).toBeInTheDocument();
    });

    it('accepts spaceY', () => {
      render(<Box spaceY="lg">text</Box>);
      expect(screen.getByText('text')).toBeInTheDocument();
    });
  });

  describe('padding props', () => {
    it('accepts innerSpaceAbove', () => {
      render(<Box innerSpaceAbove="sm">text</Box>);
      expect(screen.getByText('text')).toBeInTheDocument();
    });

    it('accepts innerSpaceBelow', () => {
      render(<Box innerSpaceBelow="md">text</Box>);
      expect(screen.getByText('text')).toBeInTheDocument();
    });

    it('accepts innerSpaceLeft', () => {
      render(<Box innerSpaceLeft="lg">text</Box>);
      expect(screen.getByText('text')).toBeInTheDocument();
    });

    it('accepts innerSpaceRight', () => {
      render(<Box innerSpaceRight="xl">text</Box>);
      expect(screen.getByText('text')).toBeInTheDocument();
    });

    it('accepts innerSpaceX', () => {
      render(<Box innerSpaceX="sm">text</Box>);
      expect(screen.getByText('text')).toBeInTheDocument();
    });

    it('accepts innerSpaceY', () => {
      render(<Box innerSpaceY="lg">text</Box>);
      expect(screen.getByText('text')).toBeInTheDocument();
    });
  });

  describe('combined props', () => {
    it('accepts margin and padding together', () => {
      render(
        <Box
          spaceBelow="lg"
          spaceAbove="md"
          innerSpaceY="sm"
          innerSpaceX="md"
        >
          combined
        </Box>,
      );
      expect(screen.getByText('combined')).toBeInTheDocument();
    });
  });

  describe('additional props', () => {
    it('spreads additional props to the element', () => {
      render(<Box data-testid="box">content</Box>);
      expect(screen.getByTestId('box')).toBeInTheDocument();
    });
  });
});
