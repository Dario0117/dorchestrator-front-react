import { render, screen } from '@testing-library/react';
import { Grid } from './grid';

describe('Grid', () => {
  describe('rendering', () => {
    it('renders children', () => {
      render(<Grid>content</Grid>);
      expect(screen.getByText('content')).toBeInTheDocument();
    });

    it('renders as a div element', () => {
      render(<Grid data-testid="grid">content</Grid>);
      expect(screen.getByTestId('grid').tagName).toBe('DIV');
    });
  });

  describe('layout props', () => {
    it('accepts cols prop', () => {
      render(<Grid cols={2}>text</Grid>);
      expect(screen.getByText('text')).toBeInTheDocument();
    });

    it('defaults to cols=1 when no cols prop given', () => {
      render(<Grid>text</Grid>);
      expect(screen.getByText('text')).toBeInTheDocument();
    });

    it('accepts cols={3}', () => {
      render(<Grid cols={3}>text</Grid>);
      expect(screen.getByText('text')).toBeInTheDocument();
    });

    it('accepts cols={4}', () => {
      render(<Grid cols={4}>text</Grid>);
      expect(screen.getByText('text')).toBeInTheDocument();
    });

    it('accepts gap prop', () => {
      render(<Grid gap="lg">text</Grid>);
      expect(screen.getByText('text')).toBeInTheDocument();
    });

    it('accepts combined cols and gap props', () => {
      render(
        <Grid
          cols={3}
          gap="lg"
        >
          combined
        </Grid>,
      );
      expect(screen.getByText('combined')).toBeInTheDocument();
    });
  });

  describe('fixedCols prop', () => {
    it('accepts fixedCols={3}', () => {
      render(<Grid fixedCols={3}>text</Grid>);
      expect(screen.getByText('text')).toBeInTheDocument();
    });

    it('accepts fixedCols={4}', () => {
      render(<Grid fixedCols={4}>text</Grid>);
      expect(screen.getByText('text')).toBeInTheDocument();
    });
  });

  describe('decoration props', () => {
    it('accepts shrink={false}', () => {
      render(<Grid shrink={false}>text</Grid>);
      expect(screen.getByText('text')).toBeInTheDocument();
    });

    it('accepts fullHeight', () => {
      render(<Grid fullHeight>text</Grid>);
      expect(screen.getByText('text')).toBeInTheDocument();
    });

    it('accepts fullWidth', () => {
      render(<Grid fullWidth>text</Grid>);
      expect(screen.getByText('text')).toBeInTheDocument();
    });

    it('accepts grow', () => {
      render(<Grid grow>text</Grid>);
      expect(screen.getByText('text')).toBeInTheDocument();
    });

    it('accepts minW0', () => {
      render(<Grid minW0>text</Grid>);
      expect(screen.getByText('text')).toBeInTheDocument();
    });

    it('accepts border', () => {
      render(<Grid border="all">text</Grid>);
      expect(screen.getByText('text')).toBeInTheDocument();
    });

    it('accepts rounded', () => {
      render(<Grid rounded="md">text</Grid>);
      expect(screen.getByText('text')).toBeInTheDocument();
    });

    it('accepts bg', () => {
      render(<Grid bg="muted">text</Grid>);
      expect(screen.getByText('text')).toBeInTheDocument();
    });

    it('accepts maxWidth', () => {
      render(<Grid maxWidth="md">text</Grid>);
      expect(screen.getByText('text')).toBeInTheDocument();
    });

    it('accepts innerSpaceY', () => {
      render(<Grid innerSpaceY="md">text</Grid>);
      expect(screen.getByText('text')).toBeInTheDocument();
    });
  });

  describe('additional props', () => {
    it('spreads additional props to the element', () => {
      render(<Grid data-testid="grid">content</Grid>);
      expect(screen.getByTestId('grid')).toBeInTheDocument();
    });
  });
});
