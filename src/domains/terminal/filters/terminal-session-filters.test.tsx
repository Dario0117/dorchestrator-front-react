import { useUserOrganizationsQueryOptions } from '@domains/org/services/organizations/list-user-organizations.http-service';
import { queryClient } from '@domains/shared/context/query.provider';
import { TerminalSessionFilterControls } from '@domains/terminal/filters/terminal-session-filters';
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
    useParams: () => ({ organizationSlug: 'test-org' }),
  };
});

let mockSearchParams: {
  page: number;
  size: number;
  status?: string;
  deviceId?: number;
  userId?: string;
  dateFrom?: string;
  dateTo?: string;
} = { page: 1, size: 25 };

vi.mock(
  '@routes/(authenticated)/$organizationSlug/t/$teamSlug/terminal/index',
  async (importOriginal) => {
    const actual =
      await importOriginal<
        typeof import('@routes/(authenticated)/$organizationSlug/t/$teamSlug/terminal/index')
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

vi.mock('@domains/shared/hooks/use-current-team', () => ({
  useCurrentTeam: vi.fn(() => ({
    id: 'team-1',
    name: 'Default Team',
    slug: 'default',
    organizationId: 'org-1',
  })),
}));

const mockOrganization = {
  id: 'org-1',
  name: 'Test Organization',
  slug: 'test-org',
  role: 'owner',
  memberCount: 1,
  createdAt: '2025-12-21T10:00:00.000Z',
  isDefault: true,
};

describe('TerminalSessionFilterControls', () => {
  beforeEach(() => {
    mockSearchParams = { page: 1, size: 25 };
    mockNavigate.mockClear();
    queryClient.setQueryData(useUserOrganizationsQueryOptions.queryKey, {
      responseData: {
        results: [mockOrganization],
        hasNext: false,
        hasPrevious: false,
        totalResults: 1,
        totalPages: 1,
        page: 1,
        size: 100,
      },
      responseErrors: null,
    });
  });

  it('should render status filter', async () => {
    renderWithProviders(<TerminalSessionFilterControls />);

    await waitFor(() => {
      expect(screen.getByLabelText('Filter by status')).toBeInTheDocument();
    });
  });

  it('should render device filter', async () => {
    renderWithProviders(<TerminalSessionFilterControls />);

    await waitFor(() => {
      expect(screen.getByLabelText('Filter by device')).toBeInTheDocument();
    });
  });

  it('should render user filter', async () => {
    renderWithProviders(<TerminalSessionFilterControls />);

    await waitFor(() => {
      expect(screen.getByLabelText('Filter by user')).toBeInTheDocument();
    });
  });

  it('should render date range inputs', async () => {
    renderWithProviders(<TerminalSessionFilterControls />);

    await waitFor(() => {
      expect(screen.getByLabelText('From date')).toBeInTheDocument();
      expect(screen.getByLabelText('To date')).toBeInTheDocument();
    });
  });

  it('should navigate when from date changes', async () => {
    const user = userEvent.setup();
    renderWithProviders(<TerminalSessionFilterControls />);

    const fromInput = await screen.findByLabelText('From date');
    await user.type(fromInput, '2026-01-15');

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalled();
    });
  });
});
