import { CodeBlock } from '@components/ds/atoms/code-block';
import { renderWithProviders } from '@lib/test-wrappers.utils';
import { screen } from '@testing-library/react';

describe('CodeBlock', () => {
  it('renders children text', () => {
    renderWithProviders(<CodeBlock>console.log('hello')</CodeBlock>);
    expect(screen.getByText("console.log('hello')")).toBeInTheDocument();
  });

  it('renders as a pre element', () => {
    renderWithProviders(<CodeBlock>some code</CodeBlock>);
    expect(screen.getByText('some code').tagName).toBe('PRE');
  });

  describe('variant', () => {
    it('applies default variant', () => {
      const { container } = renderWithProviders(<CodeBlock>code</CodeBlock>);
      expect(container.firstChild).toHaveClass(
        'rounded-md',
        'border',
        'bg-muted',
      );
    });

    it('applies terminal variant', () => {
      const { container } = renderWithProviders(
        <CodeBlock variant="terminal">code</CodeBlock>,
      );
      expect(container.firstChild).toHaveClass('bg-gray-950');
    });
  });

  describe('color', () => {
    it('applies success color', () => {
      const { container } = renderWithProviders(
        <CodeBlock color="success">code</CodeBlock>,
      );
      expect(container.firstChild).toHaveClass('text-green-400');
    });

    it('applies danger color', () => {
      const { container } = renderWithProviders(
        <CodeBlock color="danger">code</CodeBlock>,
      );
      expect(container.firstChild).toHaveClass('text-red-400');
    });
  });

  describe('maxH', () => {
    it('applies sm max height', () => {
      const { container } = renderWithProviders(
        <CodeBlock maxH="sm">code</CodeBlock>,
      );
      expect(container.firstChild).toHaveClass('max-h-[300px]');
    });

    it('applies md max height', () => {
      const { container } = renderWithProviders(
        <CodeBlock maxH="md">code</CodeBlock>,
      );
      expect(container.firstChild).toHaveClass('max-h-[500px]');
    });

    it('applies lg max height', () => {
      const { container } = renderWithProviders(
        <CodeBlock maxH="lg">code</CodeBlock>,
      );
      expect(container.firstChild).toHaveClass('max-h-[700px]');
    });
  });

  it('applies whitespace-pre-wrap by default (wrap=true)', () => {
    const { container } = renderWithProviders(<CodeBlock>code</CodeBlock>);
    expect(container.firstChild).toHaveClass('whitespace-pre-wrap');
  });

  it('does not apply whitespace-pre-wrap when wrap is false', () => {
    const { container } = renderWithProviders(
      <CodeBlock wrap={false}>code</CodeBlock>,
    );
    expect(container.firstChild).not.toHaveClass('whitespace-pre-wrap');
  });

  it('applies overflow-auto when overflowAuto is true', () => {
    const { container } = renderWithProviders(
      <CodeBlock overflowAuto>code</CodeBlock>,
    );
    expect(container.firstChild).toHaveClass('overflow-auto');
  });

  it('spreads additional props', () => {
    renderWithProviders(<CodeBlock data-testid="cb">code</CodeBlock>);
    expect(screen.getByTestId('cb')).toBeInTheDocument();
  });
});
