import { render, screen } from '@testing-library/react';
import { Flex } from './flex';

describe('Flex', () => {
  describe('rendering', () => {
    it('renders children', () => {
      render(<Flex>content</Flex>);
      expect(screen.getByText('content')).toBeInTheDocument();
    });

    it('renders as a div element', () => {
      render(<Flex data-testid="flex">content</Flex>);
      expect(screen.getByTestId('flex').tagName).toBe('DIV');
    });
  });

  describe('layout props', () => {
    it('accepts direction prop', () => {
      render(<Flex direction="column">text</Flex>);
      expect(screen.getByText('text')).toBeInTheDocument();
    });

    it('accepts align prop', () => {
      render(<Flex align="center">text</Flex>);
      expect(screen.getByText('text')).toBeInTheDocument();
    });

    it('accepts justify prop', () => {
      render(<Flex justify="between">text</Flex>);
      expect(screen.getByText('text')).toBeInTheDocument();
    });

    it('accepts wrap prop', () => {
      render(<Flex wrap="wrap">text</Flex>);
      expect(screen.getByText('text')).toBeInTheDocument();
    });

    it('accepts gap prop', () => {
      render(<Flex gap="sm">text</Flex>);
      expect(screen.getByText('text')).toBeInTheDocument();
    });

    it('accepts inline prop', () => {
      render(<Flex inline>text</Flex>);
      expect(screen.getByText('text')).toBeInTheDocument();
    });

    it('accepts multiple layout props', () => {
      render(
        <Flex
          direction="row"
          align="center"
          justify="between"
          gap="md"
        >
          combined
        </Flex>,
      );
      expect(screen.getByText('combined')).toBeInTheDocument();
    });
  });

  describe('additional props', () => {
    it('spreads additional props to the element', () => {
      render(<Flex data-testid="flex">content</Flex>);
      expect(screen.getByTestId('flex')).toBeInTheDocument();
    });
  });
});
