import { render, screen } from '@testing-library/react';
import { ResponsiveRow } from './responsive-row';

describe('ResponsiveRow', () => {
  it('should render children', () => {
    render(
      <ResponsiveRow>
        <span>Child 1</span>
        <span>Child 2</span>
      </ResponsiveRow>,
    );

    expect(screen.getByText('Child 1')).toBeInTheDocument();
    expect(screen.getByText('Child 2')).toBeInTheDocument();
  });

  it('should forward props to the underlying div', () => {
    render(
      <ResponsiveRow
        data-testid="responsive-row"
        aria-label="test row"
      >
        <span>Content</span>
      </ResponsiveRow>,
    );

    const row = screen.getByTestId('responsive-row');
    expect(row).toHaveAttribute('aria-label', 'test row');
  });

  it('should render as a div element', () => {
    render(
      <ResponsiveRow data-testid="responsive-row">
        <span>Content</span>
      </ResponsiveRow>,
    );

    const row = screen.getByTestId('responsive-row');
    expect(row.tagName).toBe('DIV');
  });
});
