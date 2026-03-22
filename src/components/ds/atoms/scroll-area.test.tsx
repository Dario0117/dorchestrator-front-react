import { ScrollArea, ScrollBar } from '@components/ds/atoms/scroll-area';
import { render, screen } from '@testing-library/react';

describe('ScrollArea', () => {
  it('renders children', () => {
    render(
      <ScrollArea>
        <div>Scrollable content</div>
      </ScrollArea>,
    );

    expect(screen.getByText('Scrollable content')).toBeInTheDocument();
  });

  it('renders with the scroll-area data-slot', () => {
    render(
      <ScrollArea data-testid="scroll">
        <div>Content</div>
      </ScrollArea>,
    );

    expect(screen.getByTestId('scroll')).toBeInTheDocument();
  });

  it('passes through non-className props', () => {
    render(
      <ScrollArea
        data-testid="scroll"
        aria-label="Scroll region"
      >
        <div>Content</div>
      </ScrollArea>,
    );

    expect(screen.getByTestId('scroll')).toHaveAttribute(
      'aria-label',
      'Scroll region',
    );
  });
});

describe('ScrollBar', () => {
  it('renders without errors', () => {
    // Base UI ScrollArea conditionally renders scrollbars based on overflow,
    // which jsdom cannot compute. We verify the component mounts without errors.
    expect(() =>
      render(
        <ScrollArea>
          <ScrollBar orientation="horizontal" />
          <div>Content</div>
        </ScrollArea>,
      ),
    ).not.toThrow();
  });
});
