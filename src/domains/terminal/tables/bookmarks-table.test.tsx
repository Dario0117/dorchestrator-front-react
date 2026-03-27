import { Table } from '@components/ds/atoms/table';
import { BookmarksTable } from '@domains/terminal/tables/bookmarks-table';
import { renderWithProviders } from '@lib/test-wrappers.utils';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const mockBookmarks = [
  {
    id: 1,
    sessionId: 100,
    deviceName: 'Server-1',
    sessionStatus: 'active',
    sessionCreatedAt: '2025-06-01T10:00:00Z',
    createdAt: '2025-06-01T11:00:00Z',
    note: '',
    recordingSizeBytes: 2048,
  },
  {
    id: 2,
    sessionId: 200,
    deviceName: 'Laptop-1',
    sessionStatus: 'terminated',
    sessionCreatedAt: '2025-05-01T10:00:00Z',
    createdAt: '2025-05-15T10:00:00Z',
    note: 'important session',
    recordingSizeBytes: null,
  },
  // biome-ignore lint/suspicious/noExplicitAny: test mock data for BookmarkItem type
] as any;

const defaultProps = {
  bookmarks: mockBookmarks,
  organizationId: 'org-1',
  onRowClick: vi.fn(),
  onDelete: vi.fn(),
  isDeletePending: false,
};

function renderTable(props = defaultProps) {
  return renderWithProviders(
    <Table>
      <BookmarksTable {...props} />
    </Table>,
  );
}

describe('BookmarksTable', () => {
  it('renders column headers', () => {
    renderTable();
    expect(screen.getByText('Device')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Session Created')).toBeInTheDocument();
    expect(screen.getByText('Bookmarked')).toBeInTheDocument();
    expect(screen.getByText('Note')).toBeInTheDocument();
    expect(screen.getByText('Recording')).toBeInTheDocument();
  });

  it('renders bookmark device names', () => {
    renderTable();
    expect(screen.getByText('Server-1')).toBeInTheDocument();
    expect(screen.getByText('Laptop-1')).toBeInTheDocument();
  });

  it('calls onRowClick when row is clicked', async () => {
    const onRowClick = vi.fn();
    const user = userEvent.setup();
    renderTable({ ...defaultProps, onRowClick });
    await user.click(screen.getByText('Server-1'));
    expect(onRowClick).toHaveBeenCalledWith(100);
  });

  it('renders delete buttons', () => {
    renderTable();
    const rows = screen.getAllByRole('row');
    // Header row + 2 data rows
    expect(rows).toHaveLength(3);
    const deleteButtons = screen.getAllByRole('button');
    expect(deleteButtons.length).toBeGreaterThanOrEqual(2);
  });

  it('disables delete when isDeletePending', () => {
    renderTable({ ...defaultProps, isDeletePending: true });
    const deleteButtons = screen.getAllByRole('button');
    const disabledButtons = deleteButtons.filter(
      (btn) => btn.getAttribute('data-disabled') !== null,
    );
    expect(disabledButtons.length).toBe(2);
  });

  it('calls onRowClick when Enter key is pressed on a row', async () => {
    const onRowClick = vi.fn();
    const user = userEvent.setup();
    renderTable({ ...defaultProps, onRowClick });
    const rows = screen.getAllByRole('row');
    const firstDataRow = rows[1] as HTMLElement;
    firstDataRow.focus();
    await user.keyboard('{Enter}');
    expect(onRowClick).toHaveBeenCalledWith(100);
  });

  it('calls onRowClick when Space key is pressed on a row', async () => {
    const onRowClick = vi.fn();
    const user = userEvent.setup();
    renderTable({ ...defaultProps, onRowClick });
    const rows = screen.getAllByRole('row');
    const firstDataRow = rows[1] as HTMLElement;
    firstDataRow.focus();
    await user.keyboard(' ');
    expect(onRowClick).toHaveBeenCalledWith(100);
  });

  it('does not call onRowClick when a non-activation key is pressed on a row', async () => {
    const onRowClick = vi.fn();
    const user = userEvent.setup();
    renderTable({ ...defaultProps, onRowClick });
    const rows = screen.getAllByRole('row');
    const firstDataRow = rows[1] as HTMLElement;
    firstDataRow.focus();
    await user.keyboard('{Tab}');
    expect(onRowClick).not.toHaveBeenCalled();
  });

  it('stops propagation when clicking on note cell', async () => {
    const onRowClick = vi.fn();
    const user = userEvent.setup();
    renderTable({ ...defaultProps, onRowClick });
    const rows = screen.getAllByRole('row');
    const firstDataRow = rows[1] as HTMLElement;
    const noteCells = firstDataRow.querySelectorAll('td');
    const noteCell = noteCells[4] as HTMLElement;
    await user.click(noteCell);
    expect(onRowClick).not.toHaveBeenCalled();
  });

  it('calls onDelete when delete button is clicked', async () => {
    const onDelete = vi.fn();
    const user = userEvent.setup();
    renderTable({ ...defaultProps, onDelete });
    // The InlineNoteEditor also renders buttons, so find delete buttons by their Trash2 icon's parent
    const rows = screen.getAllByRole('row');
    const firstDataRow = rows[1] as HTMLElement;
    const lastCell = firstDataRow.querySelectorAll('td');
    const deleteCell = lastCell[lastCell.length - 1] as HTMLElement;
    const deleteButton = deleteCell.querySelector('button') as HTMLElement;
    await user.click(deleteButton);
    expect(onDelete).toHaveBeenCalledWith(1, expect.any(Object));
  });

  it('renders dash for null recording size', () => {
    renderTable();
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('renders formatted recording size when present', () => {
    renderTable();
    expect(screen.getByText('2.0 KB')).toBeInTheDocument();
  });
});
