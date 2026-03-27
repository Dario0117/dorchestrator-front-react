import { render, screen } from '@testing-library/react';
import { SectionTitle } from './section-title';

describe('SectionTitle', () => {
  it('renders children', () => {
    render(<SectionTitle>Commands</SectionTitle>);
    expect(screen.getByText('Commands')).toBeInTheDocument();
  });

  it('renders as an h1 element', () => {
    render(<SectionTitle>Commands</SectionTitle>);
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });

  describe('size', () => {
    it('defaults to 2xl size', () => {
      const { container } = render(<SectionTitle>Title</SectionTitle>);
      expect(container.firstChild).toHaveClass('text-2xl', 'font-semibold');
    });

    it('applies sm size', () => {
      const { container } = render(
        <SectionTitle size="sm">Title</SectionTitle>,
      );
      expect(container.firstChild).toHaveClass('text-sm', 'font-medium');
    });

    it('applies lg size', () => {
      const { container } = render(
        <SectionTitle size="lg">Title</SectionTitle>,
      );
      expect(container.firstChild).toHaveClass('text-lg', 'font-semibold');
    });

    it('applies xl size', () => {
      const { container } = render(
        <SectionTitle size="xl">Title</SectionTitle>,
      );
      expect(container.firstChild).toHaveClass('text-xl', 'font-semibold');
    });
  });

  it('spreads additional props', () => {
    render(<SectionTitle data-testid="st">Title</SectionTitle>);
    expect(screen.getByTestId('st')).toBeInTheDocument();
  });
});
