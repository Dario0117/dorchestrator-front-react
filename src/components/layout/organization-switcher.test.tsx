import { OrganizationSwitcher } from '@components/layout/organization-switcher';
import { SidebarProvider } from '@components/ui/sidebar';
import { buildBackendUrl } from '@lib/test.utils';
import { renderWithProviders } from '@lib/test-wrappers.utils';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AudioWaveform, Command } from 'lucide-react';
import { HttpResponse, http } from 'msw';
import { server } from '@/../testsSetup';
import type { paths } from '@/types/api.generated.types';

type CreateOrganizationSuccessResponse =
  paths['/api/v1/organizations']['post']['responses']['201']['content']['application/json'];

const mockNavigate = vi.fn();

vi.mock('@tanstack/react-router', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@tanstack/react-router')>();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const mockTeams = [
  {
    name: 'Dorchestrator',
    slug: 'dorchestrator',
    logo: Command,
    plan: 'Vite + ShadcnUI',
  },
  {
    name: 'Acme Inc',
    slug: 'acme-inc',
    logo: AudioWaveform,
    plan: 'Enterprise',
  },
];

function renderOrganizationSwitcher(
  teams = mockTeams,
  activeSlug = 'dorchestrator',
) {
  return renderWithProviders(
    <SidebarProvider>
      <OrganizationSwitcher
        teams={teams}
        activeSlug={activeSlug}
      />
    </SidebarProvider>,
  );
}

describe('OrganizationSwitcher', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('should render with "Organizations" label and active team', async () => {
    const user = userEvent.setup();
    renderOrganizationSwitcher();

    expect(screen.getByText('Dorchestrator')).toBeInTheDocument();

    // Open dropdown and verify label
    const trigger = screen.getByRole('button', { name: /dorchestrator/i });
    await user.click(trigger);

    expect(screen.getByText('Organizations')).toBeInTheDocument();
  });

  it('should show "Add organization" button in dropdown', async () => {
    const user = userEvent.setup();
    renderOrganizationSwitcher();

    const trigger = screen.getByRole('button', { name: /dorchestrator/i });
    await user.click(trigger);

    expect(screen.getByText('Add organization')).toBeInTheDocument();
  });

  it('should open create organization dialog when "Add organization" is clicked', async () => {
    const user = userEvent.setup();
    renderOrganizationSwitcher();

    const trigger = screen.getByRole('button', { name: /dorchestrator/i });
    await user.click(trigger);

    const addButton = screen.getByRole('menuitem', {
      name: /add organization/i,
    });
    await user.click(addButton);

    expect(screen.getByText('New Organization')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Create a new organization to manage a separate set of devices and commands.',
      ),
    ).toBeInTheDocument();
  });

  it('should show create organization form in dialog', async () => {
    const user = userEvent.setup();
    renderOrganizationSwitcher();

    const trigger = screen.getByRole('button', { name: /dorchestrator/i });
    await user.click(trigger);

    const addButton = screen.getByRole('menuitem', {
      name: /add organization/i,
    });
    await user.click(addButton);

    expect(screen.getByText('Create Your Organization')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Acme Corporation')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('acme-corporation')).toBeInTheDocument();
  });

  it('should close dialog when overlay is dismissed', async () => {
    const user = userEvent.setup();
    renderOrganizationSwitcher();

    // Open dropdown, then click add
    const trigger = screen.getByRole('button', { name: /dorchestrator/i });
    await user.click(trigger);

    const addButton = screen.getByRole('menuitem', {
      name: /add organization/i,
    });
    await user.click(addButton);

    expect(screen.getByText('New Organization')).toBeInTheDocument();

    // Close dialog via the close button
    const closeButton = screen.getByRole('button', { name: /close/i });
    await user.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByText('New Organization')).not.toBeInTheDocument();
    });
  });

  it('should submit form and navigate to new organization on success', async () => {
    const user = userEvent.setup();
    renderOrganizationSwitcher();

    // Open dropdown, then click add
    const trigger = screen.getByRole('button', { name: /dorchestrator/i });
    await user.click(trigger);

    const addButton = screen.getByRole('menuitem', {
      name: /add organization/i,
    });
    await user.click(addButton);

    // Fill in the form
    const nameInput = screen.getByPlaceholderText('Acme Corporation');
    await user.type(nameInput, 'New Org');

    // Check slug availability first
    const checkButton = screen.getByRole('button', {
      name: /check availability/i,
    });
    await user.click(checkButton);

    await waitFor(() => {
      expect(screen.getByText(/Slug is available/)).toBeInTheDocument();
    });

    // Submit the form
    const submitButton = screen.getByRole('button', {
      name: /create organization/i,
    });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith({
        to: '/$organizationSlug',
        params: { organizationSlug: 'new-org' },
      });
    });

    // Dialog should close after success
    await waitFor(() => {
      expect(screen.queryByText('New Organization')).not.toBeInTheDocument();
    });
  });

  it('should navigate to new organization slug returned by the API', async () => {
    server.use(
      http.post<
        never,
        { name: string; slug: string },
        CreateOrganizationSuccessResponse
      >(buildBackendUrl('/api/v1/organizations'), async ({ request }) => {
        const body = await request.json();
        return HttpResponse.json(
          {
            responseData: {
              results: {
                id: 'org-new',
                name: body.name,
                slug: 'custom-slug-from-api',
                createdAt: '2024-01-01T00:00:00.000Z',
              },
            },
            responseErrors: null,
          },
          { status: 201 },
        );
      }),
    );

    const user = userEvent.setup();
    renderOrganizationSwitcher();

    // Open dropdown, then click add
    const trigger = screen.getByRole('button', { name: /dorchestrator/i });
    await user.click(trigger);

    const addButton = screen.getByRole('menuitem', {
      name: /add organization/i,
    });
    await user.click(addButton);

    // Fill form
    const nameInput = screen.getByPlaceholderText('Acme Corporation');
    await user.type(nameInput, 'Custom Org');

    // Check slug
    const checkButton = screen.getByRole('button', {
      name: /check availability/i,
    });
    await user.click(checkButton);

    await waitFor(() => {
      expect(screen.getByText(/Slug is available/)).toBeInTheDocument();
    });

    // Submit
    const submitButton = screen.getByRole('button', {
      name: /create organization/i,
    });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith({
        to: '/$organizationSlug',
        params: { organizationSlug: 'custom-slug-from-api' },
      });
    });
  });

  it('should not navigate when API response has no slug', async () => {
    server.use(
      http.post<
        never,
        { name: string; slug: string },
        CreateOrganizationSuccessResponse
      >(buildBackendUrl('/api/v1/organizations'), () => {
        return HttpResponse.json(
          {
            responseData: {
              results: {
                id: 'org-new',
                name: 'Test',
                slug: undefined as unknown as string,
                createdAt: '2024-01-01T00:00:00.000Z',
              },
            },
            responseErrors: null,
          },
          { status: 201 },
        );
      }),
    );

    const user = userEvent.setup();
    renderOrganizationSwitcher();

    // Open dropdown, then click add
    const trigger = screen.getByRole('button', { name: /dorchestrator/i });
    await user.click(trigger);

    const addButton = screen.getByRole('menuitem', {
      name: /add organization/i,
    });
    await user.click(addButton);

    // Fill form
    const nameInput = screen.getByPlaceholderText('Acme Corporation');
    await user.type(nameInput, 'No Slug Org');

    // Check slug
    const checkButton = screen.getByRole('button', {
      name: /check availability/i,
    });
    await user.click(checkButton);

    await waitFor(() => {
      expect(screen.getByText(/Slug is available/)).toBeInTheDocument();
    });

    // Submit
    const submitButton = screen.getByRole('button', {
      name: /create organization/i,
    });
    await user.click(submitButton);

    // Dialog should close (handleSuccess still runs setIsModalOpen(false))
    await waitFor(() => {
      expect(screen.queryByText('New Organization')).not.toBeInTheDocument();
    });

    // Navigate should NOT have been called since slug is undefined
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('should pass through props to TeamSwitcher', () => {
    renderOrganizationSwitcher(mockTeams, 'acme-inc');

    expect(screen.getByText('Acme Inc')).toBeInTheDocument();
    expect(screen.getByText('Enterprise')).toBeInTheDocument();
  });
});
