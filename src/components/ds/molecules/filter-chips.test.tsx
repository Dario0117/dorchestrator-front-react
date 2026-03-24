import { clickTrigger } from '@lib/test-wrappers.utils';
import { render, screen } from '@testing-library/react';
import { FilterChips } from './filter-chips';

const mockFilters = [
  { key: 'status', label: 'Status', value: 'Active' },
  { key: 'device', label: 'Device', value: 'Server-1' },
];

const defaultProps = {
  filters: mockFilters,
  onRemove: vi.fn(),
  onClearAll: vi.fn(),
};

function renderFilterChips(overrides = {}) {
  return render(
    <FilterChips
      {...defaultProps}
      {...overrides}
    />,
  );
}

describe('FilterChips', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders nothing when filters array is empty', () => {
      const { container } = renderFilterChips({ filters: [] });
      expect(container.firstChild).toBeNull();
    });

    it('renders chips for each filter', () => {
      renderFilterChips();
      expect(screen.getByText(/Status: Active/)).toBeInTheDocument();
      expect(screen.getByText(/Device: Server-1/)).toBeInTheDocument();
    });

    it('renders dismiss button for each chip', () => {
      renderFilterChips();
      expect(screen.getByLabelText('Remove Status filter')).toBeInTheDocument();
      expect(screen.getByLabelText('Remove Device filter')).toBeInTheDocument();
    });

    it('renders Clear all link when chips are present', () => {
      renderFilterChips();
      expect(screen.getByText('Clear all')).toBeInTheDocument();
    });
  });

  describe('interaction', () => {
    it('calls onRemove with filter key when dismiss is clicked', async () => {
      const onRemove = vi.fn();
      renderFilterChips({ onRemove });
      await clickTrigger(screen.getByLabelText('Remove Status filter'));
      expect(onRemove).toHaveBeenCalledWith('status');
    });

    it('calls onRemove with correct key for second chip', async () => {
      const onRemove = vi.fn();
      renderFilterChips({ onRemove });
      await clickTrigger(screen.getByLabelText('Remove Device filter'));
      expect(onRemove).toHaveBeenCalledWith('device');
    });

    it('calls onClearAll when Clear all is clicked', async () => {
      const onClearAll = vi.fn();
      renderFilterChips({ onClearAll });
      await clickTrigger(screen.getByText('Clear all'));
      expect(onClearAll).toHaveBeenCalledOnce();
    });
  });

  describe('single filter', () => {
    it('renders one chip and Clear all', () => {
      renderFilterChips({
        filters: [{ key: 'status', label: 'Status', value: 'Pending' }],
      });
      expect(screen.getByText(/Status: Pending/)).toBeInTheDocument();
      expect(screen.getByText('Clear all')).toBeInTheDocument();
    });
  });
});
