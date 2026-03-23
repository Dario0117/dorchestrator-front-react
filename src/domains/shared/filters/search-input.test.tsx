import { SearchInput } from '@domains/shared/filters/search-input';
import { renderWithProviders } from '@lib/test-wrappers.utils';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('SearchInput', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should render with placeholder text', () => {
    const onSearch = vi.fn();
    renderWithProviders(
      <SearchInput
        onSearch={onSearch}
        placeholder="Search commands..."
        ariaLabel="Search commands"
      />,
    );

    expect(
      screen.getByPlaceholderText('Search commands...'),
    ).toBeInTheDocument();
  });

  it('should render with current search value', () => {
    const onSearch = vi.fn();
    renderWithProviders(
      <SearchInput
        value="docker"
        onSearch={onSearch}
        ariaLabel="Search commands"
      />,
    );

    expect(screen.getByLabelText('Search commands')).toHaveValue('docker');
  });

  it('should call onSearch after debounce when 3+ chars typed', async () => {
    const onSearch = vi.fn();
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderWithProviders(
      <SearchInput
        onSearch={onSearch}
        ariaLabel="Search commands"
      />,
    );

    await user.type(screen.getByLabelText('Search commands'), 'doc');

    vi.advanceTimersByTime(300);

    await waitFor(() => {
      expect(onSearch).toHaveBeenCalledWith('doc');
    });
  });

  it('should call onSearch with undefined when fewer than 3 chars typed', async () => {
    const onSearch = vi.fn();
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderWithProviders(
      <SearchInput
        onSearch={onSearch}
        ariaLabel="Search commands"
      />,
    );

    await user.type(screen.getByLabelText('Search commands'), 'ab');

    vi.advanceTimersByTime(300);

    await waitFor(() => {
      expect(onSearch).toHaveBeenCalledWith(undefined);
    });
  });

  it('should show clear button when value is present', async () => {
    const onSearch = vi.fn();
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderWithProviders(
      <SearchInput
        onSearch={onSearch}
        ariaLabel="Search commands"
      />,
    );

    await user.type(screen.getByLabelText('Search commands'), 'test');

    expect(screen.getByLabelText('Clear search')).toBeInTheDocument();
  });

  it('should clear search on clear button click', async () => {
    const onSearch = vi.fn();
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderWithProviders(
      <SearchInput
        value="docker"
        onSearch={onSearch}
        ariaLabel="Search commands"
      />,
    );

    await user.click(screen.getByLabelText('Clear search'));

    expect(onSearch).toHaveBeenCalledWith(undefined);
  });

  it('should not show clear button when input is empty', () => {
    const onSearch = vi.fn();
    renderWithProviders(
      <SearchInput
        onSearch={onSearch}
        ariaLabel="Search commands"
      />,
    );

    expect(screen.queryByLabelText('Clear search')).not.toBeInTheDocument();
  });

  it('should cancel pending debounce when clear is clicked while typing', async () => {
    const onSearch = vi.fn();
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderWithProviders(
      <SearchInput
        onSearch={onSearch}
        ariaLabel="Search commands"
      />,
    );

    // Type some text (starts a debounce)
    await user.type(screen.getByLabelText('Search commands'), 'docker');

    // Click clear before debounce fires
    await user.click(screen.getByLabelText('Clear search'));

    // The clear should have called onSearch(undefined) immediately
    expect(onSearch).toHaveBeenCalledWith(undefined);

    // Advance past debounce - should not get a second call with "docker"
    vi.advanceTimersByTime(300);

    // Only the clear call should have fired
    const definedCalls = onSearch.mock.calls.filter(
      (c: unknown[]) => c[0] !== undefined,
    );
    expect(definedCalls).toHaveLength(0);
  });
});
