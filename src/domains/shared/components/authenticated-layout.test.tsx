import { AuthenticatedLayout } from '@domains/shared/components/authenticated-layout';
import { renderWithProviders } from '@lib/test-wrappers.utils';
import { screen, waitFor } from '@testing-library/react';
import { Suspense } from 'react';

vi.mock('@lib/cookies.utils', () => ({
  getCookie: vi.fn(() => 'true'),
  setCookie: vi.fn(),
}));

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

const mockOrganization = {
  id: 'org-1',
  name: 'Test Organization',
  slug: 'test-org',
  createdAt: new Date('2025-12-21T10:00:00.000Z'),
};

const mockTeam = {
  id: 'team-1',
  name: 'Test Team',
  slug: 'test-team',
};

const mockUseParams = vi.fn<() => Record<string, string>>(() => ({
  organizationSlug: 'test-org',
}));

vi.mock('@tanstack/react-router', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@tanstack/react-router')>();
  return {
    ...actual,
    Link: ({
      to,
      children,
      ...props
    }: {
      to: string;
      children: React.ReactNode;
    }) => (
      <a
        href={to}
        {...props}
      >
        {children}
      </a>
    ),
    useLocation: ({
      select,
    }: {
      select?: (location: { href: string }) => string;
    } = {}) => {
      const location = { href: '/' };
      return select ? select(location) : location;
    },
    useNavigate: () => vi.fn(),
    Outlet: () => <div data-testid="outlet">Outlet</div>,
    useParams: () => mockUseParams(),
    useRouterState: () => ({
      location: { pathname: '/test-org/t/test-team/' },
      matches: [
        {
          context: {
            _getNullableCurrentOrganizationFromSlug: () => mockOrganization,
          },
        },
      ],
    }),
  };
});

vi.mock('@/app', () => ({
  _getNullableCurrentOrganizationFromSlug: () => mockOrganization,
  _getNullableCurrentTeamFromSlug: () => mockTeam,
}));

vi.mock('@domains/shared/hooks/use-current-team', () => ({
  useActiveTeam: () => mockTeam,
}));

async function renderAuthenticatedLayout(children?: React.ReactNode) {
  const result = renderWithProviders(
    <Suspense fallback={<div>Loading...</div>}>
      <AuthenticatedLayout>
        {children || <div data-testid="child-content">Child Content</div>}
      </AuthenticatedLayout>
    </Suspense>,
  );

  // Wait for suspense to resolve (profile query)
  await waitFor(() => {
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
  });

  return result;
}

describe('AuthenticatedLayout', () => {
  beforeEach(() => {
    mockUseParams.mockReturnValue({ organizationSlug: 'test-org' });
  });

  it('should render children when organizationSlug is present', async () => {
    await renderAuthenticatedLayout();

    expect(screen.getByTestId('child-content')).toBeInTheDocument();
  });

  it('should render sidebar layout when organizationSlug is present', async () => {
    const { container } = await renderAuthenticatedLayout();

    const sidebarWrapper = container.querySelector(
      '[data-slot="sidebar-wrapper"]',
    );
    expect(sidebarWrapper).toBeInTheDocument();
  });

  it('should render without sidebar when no organizationSlug in params', async () => {
    mockUseParams.mockReturnValue({});

    const result = renderWithProviders(
      <Suspense fallback={<div>Loading...</div>}>
        <AuthenticatedLayout>
          <div data-testid="child-content">Child Content</div>
        </AuthenticatedLayout>
      </Suspense>,
    );

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    expect(screen.getByTestId('child-content')).toBeInTheDocument();

    const sidebarWrapper = result.container.querySelector(
      '[data-slot="sidebar-wrapper"]',
    );
    expect(sidebarWrapper).not.toBeInTheDocument();
  });

  it('should render Outlet when no children provided with organizationSlug', async () => {
    renderWithProviders(
      <Suspense fallback={<div>Loading...</div>}>
        <AuthenticatedLayout>{undefined}</AuthenticatedLayout>
      </Suspense>,
    );

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    expect(screen.getByTestId('outlet')).toBeInTheDocument();
  });

  it('should render Outlet when no children provided without organizationSlug', async () => {
    mockUseParams.mockReturnValue({});

    renderWithProviders(
      <Suspense fallback={<div>Loading...</div>}>
        <AuthenticatedLayout>{undefined}</AuthenticatedLayout>
      </Suspense>,
    );

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    expect(screen.getByTestId('outlet')).toBeInTheDocument();
  });
});
