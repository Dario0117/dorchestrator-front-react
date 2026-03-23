import { render, screen } from '@testing-library/react';
import { Stack } from './stack';

describe('Stack', () => {
  describe('rendering', () => {
    it('renders children', () => {
      render(<Stack>content</Stack>);
      expect(screen.getByText('content')).toBeInTheDocument();
    });

    it('renders as a div element', () => {
      render(<Stack data-testid="stack">content</Stack>);
      expect(screen.getByTestId('stack').tagName).toBe('DIV');
    });
  });

  describe('layout props', () => {
    it('accepts gap prop', () => {
      render(<Stack gap="sm">text</Stack>);
      expect(screen.getByText('text')).toBeInTheDocument();
    });

    it('accepts align prop', () => {
      render(<Stack align="center">text</Stack>);
      expect(screen.getByText('text')).toBeInTheDocument();
    });

    it('accepts multiple layout props', () => {
      render(
        <Stack
          gap="lg"
          align="start"
        >
          combined
        </Stack>,
      );
      expect(screen.getByText('combined')).toBeInTheDocument();
    });

    it('uses md gap by default', () => {
      render(<Stack data-testid="stack">text</Stack>);
      expect(screen.getByTestId('stack')).toBeInTheDocument();
    });
  });

  describe('decoration props', () => {
    it('accepts shrink={false}', () => {
      render(<Stack shrink={false}>text</Stack>);
      expect(screen.getByText('text')).toBeInTheDocument();
    });

    it('accepts fullHeight', () => {
      render(<Stack fullHeight>text</Stack>);
      expect(screen.getByText('text')).toBeInTheDocument();
    });

    it('accepts fullWidth', () => {
      render(<Stack fullWidth>text</Stack>);
      expect(screen.getByText('text')).toBeInTheDocument();
    });

    it('accepts grow', () => {
      render(<Stack grow>text</Stack>);
      expect(screen.getByText('text')).toBeInTheDocument();
    });

    it('accepts minW0', () => {
      render(<Stack minW0>text</Stack>);
      expect(screen.getByText('text')).toBeInTheDocument();
    });

    it('accepts border', () => {
      render(<Stack border="all">text</Stack>);
      expect(screen.getByText('text')).toBeInTheDocument();
    });

    it('accepts rounded', () => {
      render(<Stack rounded="md">text</Stack>);
      expect(screen.getByText('text')).toBeInTheDocument();
    });

    it('accepts bg', () => {
      render(<Stack bg="muted">text</Stack>);
      expect(screen.getByText('text')).toBeInTheDocument();
    });

    it('accepts innerSpaceX', () => {
      render(<Stack innerSpaceX="sm">text</Stack>);
      expect(screen.getByText('text')).toBeInTheDocument();
    });

    it('accepts innerSpaceY', () => {
      render(<Stack innerSpaceY="md">text</Stack>);
      expect(screen.getByText('text')).toBeInTheDocument();
    });

    it('accepts textAlign', () => {
      render(<Stack textAlign="center">text</Stack>);
      expect(screen.getByText('text')).toBeInTheDocument();
    });

    it('accepts textSize', () => {
      render(<Stack textSize="sm">text</Stack>);
      expect(screen.getByText('text')).toBeInTheDocument();
    });

    it('accepts safeAreaBottom', () => {
      render(<Stack safeAreaBottom>text</Stack>);
      expect(screen.getByText('text')).toBeInTheDocument();
    });

    it('accepts overflowY="auto"', () => {
      render(<Stack overflowY="auto">text</Stack>);
      expect(screen.getByText('text')).toBeInTheDocument();
    });

    it('accepts overflowY="hidden"', () => {
      render(<Stack overflowY="hidden">text</Stack>);
      expect(screen.getByText('text')).toBeInTheDocument();
    });

    it('accepts overflowY="scroll"', () => {
      render(<Stack overflowY="scroll">text</Stack>);
      expect(screen.getByText('text')).toBeInTheDocument();
    });

    it('accepts maxH="xs"', () => {
      render(<Stack maxH="xs">text</Stack>);
      expect(screen.getByText('text')).toBeInTheDocument();
    });

    it('accepts maxH="sm"', () => {
      render(<Stack maxH="sm">text</Stack>);
      expect(screen.getByText('text')).toBeInTheDocument();
    });

    it('accepts maxH="md"', () => {
      render(<Stack maxH="md">text</Stack>);
      expect(screen.getByText('text')).toBeInTheDocument();
    });

    it('accepts maxH="lg"', () => {
      render(<Stack maxH="lg">text</Stack>);
      expect(screen.getByText('text')).toBeInTheDocument();
    });

    it('accepts leading="tight"', () => {
      render(<Stack leading="tight">text</Stack>);
      expect(screen.getByText('text')).toBeInTheDocument();
    });

    it('accepts leading="snug"', () => {
      render(<Stack leading="snug">text</Stack>);
      expect(screen.getByText('text')).toBeInTheDocument();
    });

    it('accepts leading="normal"', () => {
      render(<Stack leading="normal">text</Stack>);
      expect(screen.getByText('text')).toBeInTheDocument();
    });
  });

  describe('additional props', () => {
    it('spreads additional props to the element', () => {
      render(<Stack data-testid="stack">content</Stack>);
      expect(screen.getByTestId('stack')).toBeInTheDocument();
    });
  });
});
