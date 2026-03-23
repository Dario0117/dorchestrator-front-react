import { render, screen } from '@testing-library/react';
import { HStack } from './hstack';

describe('HStack', () => {
  describe('rendering', () => {
    it('renders children', () => {
      render(<HStack>content</HStack>);
      expect(screen.getByText('content')).toBeInTheDocument();
    });

    it('renders as a div element', () => {
      render(<HStack data-testid="hstack">content</HStack>);
      expect(screen.getByTestId('hstack').tagName).toBe('DIV');
    });
  });

  describe('layout props', () => {
    it('accepts gap prop', () => {
      render(<HStack gap="sm">text</HStack>);
      expect(screen.getByText('text')).toBeInTheDocument();
    });

    it('accepts align prop', () => {
      render(<HStack align="start">text</HStack>);
      expect(screen.getByText('text')).toBeInTheDocument();
    });

    it('accepts justify prop', () => {
      render(<HStack justify="between">text</HStack>);
      expect(screen.getByText('text')).toBeInTheDocument();
    });

    it('accepts wrap prop', () => {
      render(<HStack wrap>text</HStack>);
      expect(screen.getByText('text')).toBeInTheDocument();
    });

    it('accepts multiple layout props', () => {
      render(
        <HStack
          gap="lg"
          align="center"
          justify="between"
          wrap
        >
          combined
        </HStack>,
      );
      expect(screen.getByText('combined')).toBeInTheDocument();
    });
  });

  describe('decoration props', () => {
    it('accepts grow', () => {
      render(<HStack grow>text</HStack>);
      expect(screen.getByText('text')).toBeInTheDocument();
    });

    it('accepts minW0', () => {
      render(<HStack minW0>text</HStack>);
      expect(screen.getByText('text')).toBeInTheDocument();
    });

    it('accepts overflowX="hidden"', () => {
      render(<HStack overflowX="hidden">text</HStack>);
      expect(screen.getByText('text')).toBeInTheDocument();
    });

    it('accepts overflowX="scroll"', () => {
      render(<HStack overflowX="scroll">text</HStack>);
      expect(screen.getByText('text')).toBeInTheDocument();
    });

    it('accepts innerSpaceBelow', () => {
      render(<HStack innerSpaceBelow="md">text</HStack>);
      expect(screen.getByText('text')).toBeInTheDocument();
    });
  });

  describe('additional props', () => {
    it('spreads additional props to the element', () => {
      render(<HStack data-testid="hstack">content</HStack>);
      expect(screen.getByTestId('hstack')).toBeInTheDocument();
    });
  });
});
