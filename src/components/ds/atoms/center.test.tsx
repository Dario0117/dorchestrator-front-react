import { render, screen } from '@testing-library/react';
import { Center } from './center';

describe('Center', () => {
  describe('rendering', () => {
    it('renders children', () => {
      render(<Center>content</Center>);
      expect(screen.getByText('content')).toBeInTheDocument();
    });

    it('renders as a div element', () => {
      render(<Center data-testid="center">content</Center>);
      expect(screen.getByTestId('center').tagName).toBe('DIV');
    });
  });

  describe('layout props', () => {
    it('accepts fullHeight prop', () => {
      render(<Center fullHeight>text</Center>);
      expect(screen.getByText('text')).toBeInTheDocument();
    });

    it('accepts padding prop', () => {
      render(<Center padding="md">text</Center>);
      expect(screen.getByText('text')).toBeInTheDocument();
    });

    it('accepts multiple layout props', () => {
      render(
        <Center
          fullHeight
          padding="lg"
        >
          combined
        </Center>,
      );
      expect(screen.getByText('combined')).toBeInTheDocument();
    });
  });

  describe('decoration props', () => {
    it('accepts fullScreen', () => {
      render(<Center fullScreen>text</Center>);
      expect(screen.getByText('text')).toBeInTheDocument();
    });

    it('accepts grow', () => {
      render(<Center grow>text</Center>);
      expect(screen.getByText('text')).toBeInTheDocument();
    });

    it('accepts minW0', () => {
      render(<Center minW0>text</Center>);
      expect(screen.getByText('text')).toBeInTheDocument();
    });

    it('accepts textSize="xs"', () => {
      render(<Center textSize="xs">text</Center>);
      expect(screen.getByText('text')).toBeInTheDocument();
    });

    it('accepts textSize="base"', () => {
      render(<Center textSize="base">text</Center>);
      expect(screen.getByText('text')).toBeInTheDocument();
    });

    it('accepts innerSpaceY', () => {
      render(<Center innerSpaceY="md">text</Center>);
      expect(screen.getByText('text')).toBeInTheDocument();
    });
  });

  describe('additional props', () => {
    it('spreads additional props to the element', () => {
      render(<Center data-testid="center">content</Center>);
      expect(screen.getByTestId('center')).toBeInTheDocument();
    });
  });
});
