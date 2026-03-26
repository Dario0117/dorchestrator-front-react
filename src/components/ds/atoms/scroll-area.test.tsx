import { ScrollArea, ScrollBar } from '@components/ds/atoms/scroll-area';
import { render, screen, waitFor } from '@testing-library/react';

describe('ScrollArea', () => {
  it('renders children', async () => {
    render(
      <ScrollArea>
        <div>Scrollable content</div>
      </ScrollArea>,
    );

    await waitFor(() => {
      expect(screen.getByText('Scrollable content')).toBeInTheDocument();
    });
  });

  it('renders with the scroll-area data-slot', async () => {
    render(
      <ScrollArea data-testid="scroll">
        <div>Content</div>
      </ScrollArea>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('scroll')).toBeInTheDocument();
    });
  });

  it('passes through non-className props', async () => {
    render(
      <ScrollArea
        data-testid="scroll"
        aria-label="Scroll region"
      >
        <div>Content</div>
      </ScrollArea>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('scroll')).toHaveAttribute(
        'aria-label',
        'Scroll region',
      );
    });
  });
});

describe('ScrollBar', () => {
  it('renders without errors', async () => {
    render(
      <ScrollArea>
        <ScrollBar orientation="horizontal" />
        <div>Content</div>
      </ScrollArea>,
    );

    await waitFor(() => {
      expect(screen.getByText('Content')).toBeInTheDocument();
    });
  });
});
