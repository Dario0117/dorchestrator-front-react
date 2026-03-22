import { PaginatedFooter } from '@components/ds/organisms/paginated-footer';
import { clickTrigger, renderWithProviders } from '@lib/test-wrappers.utils';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const defaultProps = {
  totalResults: 42,
  singularLabel: 'result',
  pluralLabel: 'results',
  page: 2,
  totalPages: 5,
  hasNext: true,
  hasPrevious: true,
  size: 25,
  onPageChange: vi.fn(),
  onSizeChange: vi.fn(),
};

function renderFooter(overrides: Partial<typeof defaultProps> = {}) {
  const props = { ...defaultProps, ...overrides };
  return renderWithProviders(<PaginatedFooter {...props} />);
}

describe('PaginatedFooter', () => {
  describe('total count display', () => {
    it('renders total count with plural label', () => {
      renderFooter();
      expect(screen.getByText('42 total results')).toBeInTheDocument();
    });

    it('renders total count with singular label when count is 1', () => {
      renderFooter({ totalResults: 1 });
      expect(screen.getByText('1 total result')).toBeInTheDocument();
    });

    it('renders total count with plural label when count is 0', () => {
      renderFooter({ totalResults: 0 });
      expect(screen.getByText('0 total results')).toBeInTheDocument();
    });
  });

  describe('page indicator', () => {
    it('renders page indicator with current page and total', () => {
      renderFooter();
      expect(screen.getByText('Page 2 of 5')).toBeInTheDocument();
    });
  });

  describe('prev/next navigation', () => {
    it('disables previous button when hasPrevious is false', () => {
      renderFooter({ hasPrevious: false });
      const prevButton = screen.getByLabelText('Go to previous page');
      expect(prevButton).toHaveAttribute('aria-disabled', 'true');
    });

    it('disables next button when hasNext is false', () => {
      renderFooter({ hasNext: false });
      const nextButton = screen.getByLabelText('Go to next page');
      expect(nextButton).toHaveAttribute('aria-disabled', 'true');
    });

    it('enables previous button when hasPrevious is true', () => {
      renderFooter({ hasPrevious: true });
      const prevButton = screen.getByLabelText('Go to previous page');
      expect(prevButton).not.toHaveAttribute('aria-disabled', 'true');
    });

    it('enables next button when hasNext is true', () => {
      renderFooter({ hasNext: true });
      const nextButton = screen.getByLabelText('Go to next page');
      expect(nextButton).not.toHaveAttribute('aria-disabled', 'true');
    });

    it('calls onPageChange with previous page when prev clicked', async () => {
      const onPageChange = vi.fn();
      renderFooter({ page: 3, onPageChange });
      await userEvent.click(screen.getByLabelText('Go to previous page'));
      expect(onPageChange).toHaveBeenCalledWith(2);
    });

    it('calls onPageChange with next page when next clicked', async () => {
      const onPageChange = vi.fn();
      renderFooter({ page: 3, onPageChange });
      await userEvent.click(screen.getByLabelText('Go to next page'));
      expect(onPageChange).toHaveBeenCalledWith(4);
    });
  });

  describe('page size selector', () => {
    it('renders page size selector with current size', () => {
      renderFooter({ size: 25 });
      expect(screen.getByLabelText('Page size')).toBeInTheDocument();
    });

    it('calls onSizeChange when a different page size is selected', async () => {
      const onSizeChange = vi.fn();
      renderFooter({ size: 25, onSizeChange });

      const trigger = screen.getByLabelText('Page size');
      await clickTrigger(trigger);

      await waitFor(() => {
        expect(screen.getAllByRole('option').length).toBeGreaterThan(0);
      });

      const option50 = screen.getByRole('option', { name: '50 per page' });
      await userEvent.click(option50);

      expect(onSizeChange).toHaveBeenCalledWith(50);
    });
  });
});
