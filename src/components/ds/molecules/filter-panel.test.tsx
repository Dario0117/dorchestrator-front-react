import { clickTrigger } from '@lib/test-wrappers.utils';
import { render, screen } from '@testing-library/react';
import { FilterPanel } from './filter-panel';

const defaultProps = {
  activeFilterCount: 0,
  onClear: vi.fn(),
  onApply: vi.fn(),
  open: false,
  onOpenChange: vi.fn(),
};

function renderFilterPanel(overrides = {}) {
  const props = { ...defaultProps, ...overrides };
  return render(
    <FilterPanel {...props}>
      <input
        aria-label="test filter"
        data-testid="filter-child"
      />
    </FilterPanel>,
  );
}

describe('FilterPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('trigger button', () => {
    it('renders trigger with "Filter" text when no active filters', () => {
      renderFilterPanel();
      expect(screen.getByText('Filter')).toBeInTheDocument();
    });

    it('renders trigger with "Filter" text and badge when filters are active', () => {
      renderFilterPanel({ activeFilterCount: 3 });
      expect(screen.getByText('Filter')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('shows badge with count when filters are active', () => {
      renderFilterPanel({ activeFilterCount: 2 });
      expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('does not show badge when no active filters', () => {
      renderFilterPanel({ activeFilterCount: 0 });
      expect(screen.queryByText('0')).not.toBeInTheDocument();
    });
  });

  describe('popover content', () => {
    it('does not show children when closed', () => {
      renderFilterPanel({ open: false });
      expect(screen.queryByTestId('filter-child')).not.toBeInTheDocument();
    });

    it('shows children when open', () => {
      renderFilterPanel({ open: true });
      expect(screen.getByTestId('filter-child')).toBeInTheDocument();
    });

    it('renders Apply and Clear all buttons when open', () => {
      renderFilterPanel({ open: true });
      expect(screen.getByText('Apply')).toBeInTheDocument();
      expect(screen.getByText('Clear all')).toBeInTheDocument();
    });

    it('has dialog role with accessible label', () => {
      renderFilterPanel({ open: true });
      expect(
        screen.getByRole('dialog', { name: 'Filter options' }),
      ).toBeInTheDocument();
    });
  });

  describe('interaction', () => {
    it('calls onOpenChange when trigger is clicked', async () => {
      const onOpenChange = vi.fn();
      renderFilterPanel({ onOpenChange });
      await clickTrigger(screen.getByText('Filter'));
      expect(onOpenChange).toHaveBeenCalled();
    });

    it('calls onApply and closes when Apply is clicked', async () => {
      const onApply = vi.fn();
      const onOpenChange = vi.fn();
      renderFilterPanel({ open: true, onApply, onOpenChange });
      await clickTrigger(screen.getByText('Apply'));
      expect(onApply).toHaveBeenCalledOnce();
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it('calls onClear and closes when Clear all is clicked', async () => {
      const onClear = vi.fn();
      const onOpenChange = vi.fn();
      renderFilterPanel({
        open: true,
        activeFilterCount: 2,
        onClear,
        onOpenChange,
      });
      await clickTrigger(screen.getByText('Clear all'));
      expect(onClear).toHaveBeenCalledOnce();
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it('disables Clear all when no active filters', () => {
      renderFilterPanel({ open: true, activeFilterCount: 0 });
      expect(screen.getByText('Clear all').closest('button')).toBeDisabled();
    });

    it('enables Clear all when filters are active', () => {
      renderFilterPanel({ open: true, activeFilterCount: 1 });
      expect(screen.getByText('Clear all').closest('button')).toBeEnabled();
    });
  });

  describe('without onApply', () => {
    it('closes popover when Apply is clicked even without onApply', async () => {
      const onOpenChange = vi.fn();
      renderFilterPanel({ open: true, onApply: undefined, onOpenChange });
      await clickTrigger(screen.getByText('Apply'));
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
  });
});
