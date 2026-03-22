import { render, screen } from '@testing-library/react';
import { AlertTriangle } from 'lucide-react';
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
  });
});
