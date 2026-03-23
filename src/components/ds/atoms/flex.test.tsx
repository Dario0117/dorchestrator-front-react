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

  describe('decoration props', () => {
    it('accepts shrink={false}', () => {
      render(<Flex shrink={false}>text</Flex>);
      expect(screen.getByText('text')).toBeInTheDocument();
    });

    it('accepts fullHeight', () => {
      render(<Flex fullHeight>text</Flex>);
      expect(screen.getByText('text')).toBeInTheDocument();
    });

    it('accepts grow', () => {
      render(<Flex grow>text</Flex>);
      expect(screen.getByText('text')).toBeInTheDocument();
    });

    it('accepts minW0', () => {
      render(<Flex minW0>text</Flex>);
      expect(screen.getByText('text')).toBeInTheDocument();
    });

    it('accepts border', () => {
      render(<Flex border="all">text</Flex>);
      expect(screen.getByText('text')).toBeInTheDocument();
    });

    it('accepts rounded', () => {
      render(<Flex rounded="md">text</Flex>);
      expect(screen.getByText('text')).toBeInTheDocument();
    });

    it('accepts bg', () => {
      render(<Flex bg="muted">text</Flex>);
      expect(screen.getByText('text')).toBeInTheDocument();
    });
  });

  describe('additional props', () => {
    it('spreads additional props to the element', () => {
      render(<Flex data-testid="flex">content</Flex>);
      expect(screen.getByTestId('flex')).toBeInTheDocument();
    });
  });
});
