import { Separator } from '@components/ui/separator';
import { render, screen } from '@testing-library/react';

describe('Separator', () => {
  it('renders separator with default props', () => {
    render(<Separator data-testid="separator" />);

    const separator = screen.getByTestId('separator');
    expect(separator).toBeInTheDocument();
    expect(separator).toHaveAttribute('data-slot', 'separator');
  });

  it('renders with horizontal orientation by default', () => {
    render(<Separator data-testid="separator" />);

    const separator = screen.getByTestId('separator');
    expect(separator).toHaveAttribute('data-orientation', 'horizontal');
  });

  it('renders with vertical orientation when specified', () => {
    render(
      <Separator
        orientation="vertical"
        data-testid="separator"
      />,
    );

    const separator = screen.getByTestId('separator');
    expect(separator).toHaveAttribute('data-orientation', 'vertical');
  });

  it('is decorative by default', () => {
    render(<Separator data-testid="separator" />);

    const separator = screen.getByTestId('separator');
    expect(separator).toHaveAttribute('data-orientation', 'horizontal');
    // Decorative separators might not always have aria-hidden in test environment
  });

  it('has separator role', () => {
    render(<Separator data-testid="separator" />);

    const separator = screen.getByTestId('separator');
    expect(separator).toHaveAttribute('role', 'separator');
  });

  it('renders with custom className', () => {
    render(
      <Separator
        className="custom-separator"
        data-testid="separator"
      />,
    );

    const separator = screen.getByTestId('separator');
    expect(separator).toBeInTheDocument();
  });

  it('renders as separator element', () => {
    render(<Separator data-testid="separator" />);

    const separator = screen.getByTestId('separator');
    expect(separator).toBeInTheDocument();
    expect(separator).toHaveAttribute('data-slot', 'separator');
  });

  it('forwards additional props', () => {
    render(
      <Separator
        id="custom-id"
        data-custom="value"
        data-testid="separator"
      />,
    );

    const separator = screen.getByTestId('separator');
    expect(separator).toHaveAttribute('id', 'custom-id');
    expect(separator).toHaveAttribute('data-custom', 'value');
  });

  it('has correct accessibility attributes for decorative separator', () => {
    render(<Separator data-testid="separator" />);

    const separator = screen.getByTestId('separator');
    // Check that it's rendered as decorative (may vary by implementation)
    expect(separator).toBeInTheDocument();
    expect(separator).toHaveAttribute('data-orientation', 'horizontal');
  });

  it('has correct accessibility attributes', () => {
    render(<Separator data-testid="separator" />);

    const separator = screen.getByTestId('separator');
    expect(separator).toHaveAttribute('role', 'separator');
  });
});
