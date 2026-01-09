import { SkipToMain } from '@components/skip-to-main';
import { render, screen } from '@testing-library/react';

describe('SkipToMain', () => {
  it('renders skip to main link', () => {
    render(<SkipToMain />);

    const link = screen.getByRole('link', { name: 'Skip to Main' });
    expect(link).toBeInTheDocument();
  });

  it('has correct href attribute', () => {
    render(<SkipToMain />);

    const link = screen.getByRole('link', { name: 'Skip to Main' });
    expect(link).toHaveAttribute('href', '#content');
  });

  it('has accessibility-focused styling classes', () => {
    render(<SkipToMain />);

    const link = screen.getByRole('link', { name: 'Skip to Main' });

    // Check for key accessibility and positioning classes
    expect(link).toHaveClass('fixed');
    expect(link).toHaveClass('z-999');
    expect(link).toHaveClass('-translate-y-52');
    expect(link).toHaveClass('focus:translate-y-3');
    expect(link).toHaveClass('focus:transform');
  });

  it('has proper button styling', () => {
    render(<SkipToMain />);

    const link = screen.getByRole('link', { name: 'Skip to Main' });

    // Check for button-like styling
    expect(link).toHaveClass('bg-primary');
    expect(link).toHaveClass('text-primary-foreground');
    expect(link).toHaveClass('hover:bg-primary/90');
    expect(link).toHaveClass('px-4');
    expect(link).toHaveClass('py-2');
    expect(link).toHaveClass('text-sm');
    expect(link).toHaveClass('font-medium');
  });

  it('has correct text content', () => {
    render(<SkipToMain />);

    const link = screen.getByText('Skip to Main');
    expect(link).toBeInTheDocument();
  });

  it('is positioned for screen reader navigation', () => {
    render(<SkipToMain />);

    const link = screen.getByRole('link', { name: 'Skip to Main' });

    // These classes ensure the link is hidden until focused
    expect(link).toHaveClass('-translate-y-52'); // Hidden above viewport
    expect(link).toHaveClass('focus:translate-y-3'); // Visible when focused
  });

  it('has focus ring for keyboard navigation', () => {
    render(<SkipToMain />);

    const link = screen.getByRole('link', { name: 'Skip to Main' });
    expect(link).toHaveClass('focus-visible:ring-ring');
    expect(link).toHaveClass('focus-visible:ring-1');
  });

  it('uses semantic HTML for accessibility', () => {
    render(<SkipToMain />);

    // Should be an anchor tag, not a button or div
    const link = screen.getByRole('link');
    expect(link.tagName).toBe('A');
    expect(link).toHaveAttribute('href', '#content');
  });
});
