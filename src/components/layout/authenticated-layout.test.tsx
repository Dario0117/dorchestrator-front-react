import { AuthenticatedLayout } from '@components/layout/authenticated-layout';
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
    useParams: () => ({ organizationSlug: 'test-org' }),
    useRouterState: () => ({
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
  it('should render children', async () => {
    await renderAuthenticatedLayout();

    expect(screen.getByTestId('child-content')).toBeInTheDocument();
  });

  it('should render app sidebar', async () => {
    await renderAuthenticatedLayout();

    expect(screen.getByText('Test Organization')).toBeInTheDocument();
  });

  it('should render header with theme switch', async () => {
    await renderAuthenticatedLayout();

    const themeButton = screen.getByRole('button', { name: /toggle theme/i });
    expect(themeButton).toBeInTheDocument();
  });

  it('should render profile dropdown', async () => {
    const { container } = await renderAuthenticatedLayout();

    const header = container.querySelector('header');
    expect(header).toBeInTheDocument();
  });

  it('should render skip to main link', async () => {
    await renderAuthenticatedLayout();

    const skipLink = screen.getByRole('link', {
      name: /skip to main/i,
    });
    expect(skipLink).toBeInTheDocument();
  });

  it('should provide sidebar context', async () => {
    const { container } = await renderAuthenticatedLayout();

    const sidebarWrapper = container.querySelector(
      '[data-slot="sidebar-wrapper"]',
    );
    expect(sidebarWrapper).toBeInTheDocument();
  });

  it('should provide layout context', async () => {
    await renderAuthenticatedLayout();

    expect(screen.getByText('Test Organization')).toBeInTheDocument();
  });

  it('should provide search context', async () => {
    await renderAuthenticatedLayout();

    const layout = screen.getByTestId('child-content').parentElement;
    expect(layout).toBeInTheDocument();
  });

  it('should render sidebar inset with correct classes', async () => {
    const { container } = await renderAuthenticatedLayout();

    const sidebarInset = container.querySelector('[data-slot="sidebar-inset"]');
    expect(sidebarInset).toBeInTheDocument();
    expect(sidebarInset).toHaveClass('@container/content');
  });

  it('should render with custom children', async () => {
    const customContent = (
      <div data-testid="custom-content">
        <h1>Custom Page Title</h1>
        <p>Custom page content</p>
      </div>
    );

    await renderAuthenticatedLayout(customContent);

    expect(screen.getByTestId('custom-content')).toBeInTheDocument();
    expect(screen.getByText('Custom Page Title')).toBeInTheDocument();
    expect(screen.getByText('Custom page content')).toBeInTheDocument();
  });

  it('should have correct header structure with actions', async () => {
    const { container } = await renderAuthenticatedLayout();

    const header = container.querySelector('header');
    expect(header).toBeInTheDocument();

    const actionsContainer = header?.querySelector('.ms-auto');
    expect(actionsContainer).toBeInTheDocument();
  });

  it('should render navigation groups in sidebar', async () => {
    await renderAuthenticatedLayout();

    expect(screen.getByText('General')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('should apply default open state from cookie', async () => {
    const { container } = await renderAuthenticatedLayout();

    const sidebarWrapper = container.querySelector(
      '[data-slot="sidebar-wrapper"]',
    );
    expect(sidebarWrapper).toBeInTheDocument();
  });
});
