import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AlertTriangle, Plus } from 'lucide-react';
import { EmptyState } from './empty-state';

describe('EmptyState', () => {
  describe('rendering', () => {
    it('renders title and description', () => {
      render(
        <EmptyState
          icon={AlertTriangle}
          title="No items"
          description="There are no items to display."
        />,
      );
      expect(screen.getByText('No items')).toBeInTheDocument();
      expect(
        screen.getByText('There are no items to display.'),
      ).toBeInTheDocument();
    });
  });

  describe('semantic props', () => {
    it('accepts action prop', () => {
      render(
        <EmptyState
          icon={AlertTriangle}
          title="Empty"
          description="Nothing here"
          action={<button type="button">Add item</button>}
        />,
      );
      expect(
        screen.getByRole('button', { name: 'Add item' }),
      ).toBeInTheDocument();
    });

    it('renders without action', () => {
      render(
        <EmptyState
          icon={AlertTriangle}
          title="Empty"
          description="Nothing here"
        />,
      );
      expect(screen.getByText('Empty')).toBeInTheDocument();
    });

    it('renders CTA button from ctaLabel and ctaAction', async () => {
      const handleClick = vi.fn();
      render(
        <EmptyState
          icon={AlertTriangle}
          title="No items"
          description="Nothing here"
          ctaLabel="Add Item"
          ctaAction={handleClick}
          ctaIcon={Plus}
        />,
      );
      const button = screen.getByRole('button', { name: /Add Item/ });
      expect(button).toBeInTheDocument();
      await userEvent.click(button);
      expect(handleClick).toHaveBeenCalledOnce();
    });

    it('does not render CTA when ctaAction is missing', () => {
      render(
        <EmptyState
          icon={AlertTriangle}
          title="No items"
          description="Nothing here"
          ctaLabel="Add Item"
        />,
      );
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('prefers action prop over ctaLabel/ctaAction', () => {
      render(
        <EmptyState
          icon={AlertTriangle}
          title="No items"
          description="Nothing here"
          action={<button type="button">Custom Action</button>}
          ctaLabel="CTA Button"
          ctaAction={vi.fn()}
        />,
      );
      expect(
        screen.getByRole('button', { name: 'Custom Action' }),
      ).toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: /CTA Button/ }),
      ).not.toBeInTheDocument();
    });
  });

  describe('minimal render', () => {
    it('renders with default variant and no optional props', () => {
      render(<EmptyState />);
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
  });

  describe('filtered variant', () => {
    it('renders filtered defaults when variant is filtered', () => {
      render(
        <EmptyState
          variant="filtered"
          ctaAction={vi.fn()}
        />,
      );
      expect(
        screen.getByText('No results match your filters'),
      ).toBeInTheDocument();
      expect(
        screen.getByText('Try adjusting your search criteria.'),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /Clear Filters/ }),
      ).toBeInTheDocument();
    });

    it('calls ctaAction when filtered CTA is clicked', async () => {
      const handleClear = vi.fn();
      render(
        <EmptyState
          variant="filtered"
          ctaAction={handleClear}
        />,
      );
      await userEvent.click(
        screen.getByRole('button', { name: /Clear Filters/ }),
      );
      expect(handleClear).toHaveBeenCalledOnce();
    });

    it('allows overriding filtered defaults', () => {
      render(
        <EmptyState
          variant="filtered"
          title="Custom filtered title"
          ctaAction={vi.fn()}
        />,
      );
      expect(screen.getByText('Custom filtered title')).toBeInTheDocument();
    });
  });
});
