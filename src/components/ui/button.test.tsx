import { Button } from '@components/ui/button';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('Button', () => {
  it('should render successfully with default variant and size', () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole('button', { name: 'Click me' });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('data-slot', 'button');
  });

  it('should render with custom className', () => {
    render(<Button className="custom-class">Test</Button>);
    const button = screen.getByRole('button', { name: 'Test' });
    expect(button).toHaveClass('custom-class');
  });

  it('should render with different variants', () => {
    const { rerender } = render(
      <Button variant="destructive">Destructive</Button>,
    );
    let button = screen.getByRole('button', { name: 'Destructive' });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('data-slot', 'button');

    rerender(<Button variant="outline">Outline</Button>);
    button = screen.getByRole('button', { name: 'Outline' });
    expect(button).toBeInTheDocument();

    rerender(<Button variant="secondary">Secondary</Button>);
    button = screen.getByRole('button', { name: 'Secondary' });
    expect(button).toBeInTheDocument();

    rerender(<Button variant="ghost">Ghost</Button>);
    button = screen.getByRole('button', { name: 'Ghost' });
    expect(button).toBeInTheDocument();

    rerender(<Button variant="link">Link</Button>);
    button = screen.getByRole('button', { name: 'Link' });
    expect(button).toBeInTheDocument();
  });

  it('should render with different sizes', () => {
    const { rerender } = render(<Button size="sm">Small</Button>);
    let button = screen.getByRole('button', { name: 'Small' });
    expect(button).toBeInTheDocument();

    rerender(<Button size="lg">Large</Button>);
    button = screen.getByRole('button', { name: 'Large' });
    expect(button).toBeInTheDocument();

    rerender(<Button size="icon">Icon</Button>);
    button = screen.getByRole('button', { name: 'Icon' });
    expect(button).toBeInTheDocument();
  });

  it('should handle click events', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    render(<Button onClick={handleClick}>Click me</Button>);
    const button = screen.getByRole('button', { name: 'Click me' });

    await user.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>);
    const button = screen.getByRole('button', { name: 'Disabled' });
    expect(button).toBeDisabled();
  });

  it('should render as child component when asChild is true', () => {
    render(
      <Button asChild>
        <a href="/test">Link Button</a>
      </Button>,
    );
    const link = screen.getByRole('link', { name: 'Link Button' });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/test');
    expect(link).toHaveAttribute('data-slot', 'button');
  });

  it('should forward all props correctly', () => {
    render(
      <Button
        type="submit"
        aria-label="Submit form"
        data-testid="submit-button"
      >
        Submit
      </Button>,
    );
    const button = screen.getByRole('button', { name: 'Submit form' });
    expect(button).toHaveAttribute('type', 'submit');
    expect(button).toHaveAttribute('aria-label', 'Submit form');
    expect(button).toHaveAttribute('data-testid', 'submit-button');
  });

  it('should render with focus capability', () => {
    render(<Button>Focus me</Button>);
    const button = screen.getByRole('button', { name: 'Focus me' });
    expect(button).toBeInTheDocument();
    button.focus();
    expect(button).toHaveFocus();
  });

  it('should combine variant and size correctly', () => {
    render(
      <Button
        variant="destructive"
        size="lg"
      >
        Large Destructive
      </Button>,
    );
    const button = screen.getByRole('button', { name: 'Large Destructive' });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('data-slot', 'button');
  });

  describe('Mobile Touch Target Requirements (AC1)', () => {
    it('default button meets 44px minimum height for mobile', () => {
      render(<Button>Click me</Button>);
      const button = screen.getByRole('button', { name: 'Click me' });

      // h-11 = 2.75rem = 44px (meets WCAG 2.5.5 AAA and Apple HIG standards)
      expect(button).toHaveClass('h-11');
    });

    it('icon button meets 44px minimum size for mobile', () => {
      render(
        <Button
          size="icon"
          aria-label="Icon button"
        />,
      );
      const button = screen.getByRole('button');

      // size-11 = 44px × 44px (meets touch target standards)
      expect(button).toHaveClass('size-11');
    });

    it('small button meets 44px minimum height despite smaller font', () => {
      render(<Button size="sm">Small</Button>);
      const button = screen.getByRole('button', { name: 'Small' });

      // h-11 = 44px (meets touch target minimum)
      // text-sm provides visual distinction while maintaining accessibility
      expect(button).toHaveClass('h-11');
      expect(button).toHaveClass('text-sm');
    });

    it('large button exceeds minimum touch target', () => {
      render(<Button size="lg">Large</Button>);
      const button = screen.getByRole('button', { name: 'Large' });

      // h-12 = 48px (exceeds 44px minimum, matches Material Design 48dp recommendation)
      expect(button).toHaveClass('h-12');
    });
  });
});
