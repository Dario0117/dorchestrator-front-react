import { CommandSearchInput } from '@domains/commands/filters/command-search-input';
import { renderWithProviders } from '@lib/test-wrappers.utils';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const mockNavigate = vi.fn();

vi.mock('@tanstack/react-router', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@tanstack/react-router')>();
  return {
    ...actual,
    useNavigate: vi.fn(() => mockNavigate),
  };
});

let mockSearchParams: Record<string, unknown> = { page: 1, size: 25 };

vi.mock(
  '@routes/(authenticated)/$organizationSlug/t/$teamSlug/commands/index',
  async (importOriginal) => {
    const actual =
      await importOriginal<
        typeof import('@routes/(authenticated)/$organizationSlug/t/$teamSlug/commands/index')
      >();
    return {
      ...actual,
      Route: {
        ...actual.Route,
        useSearch: vi.fn(() => mockSearchParams),
      },
    };
  },
);

describe('CommandSearchInput', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    mockNavigate.mockClear();
    mockSearchParams = { page: 1, size: 25 };
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should render search input', () => {
    renderWithProviders(<CommandSearchInput />);
    expect(
      screen.getByPlaceholderText('Search commands...'),
    ).toBeInTheDocument();
  });

  it('should navigate with search value after debounce', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderWithProviders(<CommandSearchInput />);

    await user.type(
      screen.getByPlaceholderText('Search commands...'),
      'docker',
    );

    vi.advanceTimersByTime(300);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalled();
    });

    const call = mockNavigate.mock.calls[0] as [
      { search: (prev: Record<string, unknown>) => Record<string, unknown> },
    ];
    const result = call[0].search({ page: 1, size: 25 });
    expect(result.search).toBe('docker');
  });
});
