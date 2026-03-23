import { SkipToMain } from '@domains/shared/components/skip-to-main';
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

  it('has correct text content', () => {
    render(<SkipToMain />);

    const link = screen.getByText('Skip to Main');
    expect(link).toBeInTheDocument();
  });

  it('uses semantic HTML for accessibility', () => {
    render(<SkipToMain />);

    // Should be an anchor tag, not a button or div
    const link = screen.getByRole('link');
    expect(link.tagName).toBe('A');
    expect(link).toHaveAttribute('href', '#content');
  });
});
