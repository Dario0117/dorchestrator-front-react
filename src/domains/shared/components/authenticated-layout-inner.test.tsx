import { AuthenticatedLayoutInner } from '@domains/shared/components/authenticated-layout-inner';
import { LayoutProvider } from '@domains/shared/context/layout.provider';
import { renderWithProviders } from '@lib/test-wrappers.utils';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Suspense } from 'react';

vi.mock('@lib/cookies.utils', () => ({
  getCookie: vi.fn(() => 'true'),
  setCookie: vi.fn(),
}));

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

const mockSetOpen = vi.fn();
const mockHandleSelect = vi.fn();

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

vi.mock('@domains/shared/hooks/use-command-palette', () => ({
  useCommandPalette: () => ({
    open: false,
    setOpen: mockSetOpen,
    handleSelect: mockHandleSelect,
  }),
}));

async function renderComponent(
  params?: Record<string, string>,
  children?: React.ReactNode,
) {
  if (params) {
    mockUseParams.mockReturnValue(params);
  }

  const result = renderWithProviders(
    <Suspense fallback={<div>Loading...</div>}>
      <LayoutProvider>
        <AuthenticatedLayoutInner defaultOpen={true}>
          {children}
        </AuthenticatedLayoutInner>
      </LayoutProvider>
    </Suspense>,
  );

  await waitFor(() => {
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
  });

  return result;
}

describe('AuthenticatedLayoutInner', () => {
  beforeEach(() => {
    mockUseParams.mockReturnValue({ organizationSlug: 'test-org' });
    mockSetOpen.mockClear();
  });

  it('should render with children', async () => {
    await renderComponent(
      undefined,
      <div data-testid="child-content">Child Content</div>,
    );

    expect(screen.getByTestId('child-content')).toBeInTheDocument();
  });

  it('should render Outlet when no children provided', async () => {
    await renderComponent();

    expect(screen.getByTestId('outlet')).toBeInTheDocument();
  });

  it('should call setOpen(true) when CommandPaletteTrigger is clicked', async () => {
    const user = userEvent.setup();
    await renderComponent();

    const searchButtons = screen.getAllByRole('button', { name: 'Search' });
    await user.click(searchButtons[0] as HTMLElement);

    expect(mockSetOpen).toHaveBeenCalledWith(true);
  });

  it('should use org-only basePath when teamSlug is not in params', async () => {
    const { container } = await renderComponent({
      organizationSlug: 'test-org',
    });

    const dashboardLink = container.querySelector('a[href="/test-org/"]');
    expect(dashboardLink).toBeInTheDocument();
  });

  it('should use team basePath when teamSlug is in params', async () => {
    const { container } = await renderComponent({
      organizationSlug: 'test-org',
      teamSlug: 'my-team',
    });

    const dashboardLink = container.querySelector(
      'a[href="/test-org/t/my-team/"]',
    );
    expect(dashboardLink).toBeInTheDocument();
  });
});
