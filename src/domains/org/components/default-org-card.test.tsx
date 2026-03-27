import { buildBackendUrl } from '@lib/test-backend-url.utils';
import { renderWithProviders } from '@lib/test-wrappers.utils';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { delay, HttpResponse, http } from 'msw';
import { server } from '@/../testsSetup';
import { DefaultOrgCard } from './default-org-card';

describe('DefaultOrgCard', () => {
  it('renders card title', () => {
    renderWithProviders(
      <DefaultOrgCard
        isDefault
        organizationId="org-1"
      />,
    );
    expect(screen.getByText('Default Organization')).toBeInTheDocument();
  });

  it('shows success message when organization is default', () => {
    renderWithProviders(
      <DefaultOrgCard
        isDefault
        organizationId="org-1"
      />,
    );
    expect(
      screen.getByText(/This is your default organization/),
    ).toBeInTheDocument();
  });

  it('does not show set button when already default', () => {
    renderWithProviders(
      <DefaultOrgCard
        isDefault
        organizationId="org-1"
      />,
    );
    expect(
      screen.queryByRole('button', { name: /Set as default/ }),
    ).not.toBeInTheDocument();
  });

  it('shows set as default button when not default', () => {
    renderWithProviders(
      <DefaultOrgCard
        isDefault={false}
        organizationId="org-1"
      />,
    );
    expect(
      screen.getByRole('button', { name: /Set as default organization/ }),
    ).toBeInTheDocument();
  });

  it('shows description text when not default', () => {
    renderWithProviders(
      <DefaultOrgCard
        isDefault={false}
        organizationId="org-1"
      />,
    );
    expect(
      screen.getByText(/Set this organization as your default/),
    ).toBeInTheDocument();
  });

  it('calls mutation and shows pending state when button is clicked', async () => {
    server.use(
      http.put(buildBackendUrl('/api/v1/organizations/default'), async () => {
        await delay('infinite');
        return HttpResponse.json({});
      }),
    );

    const user = userEvent.setup();
    renderWithProviders(
      <DefaultOrgCard
        isDefault={false}
        organizationId="org-1"
      />,
    );

    await user.click(
      screen.getByRole('button', { name: /Set as default organization/ }),
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Setting/ })).toBeDisabled();
    });
  });

  it('shows error alert when mutation fails', async () => {
    server.use(
      http.put(buildBackendUrl('/api/v1/organizations/default'), () => {
        return HttpResponse.json(
          { message: 'Something went wrong' },
          { status: 500 },
        );
      }),
    );

    const user = userEvent.setup();
    renderWithProviders(
      <DefaultOrgCard
        isDefault={false}
        organizationId="org-1"
      />,
    );

    await user.click(
      screen.getByRole('button', { name: /Set as default organization/ }),
    );

    await waitFor(() => {
      expect(
        screen.getByText(/Failed to set default organization/),
      ).toBeInTheDocument();
    });
  });
});
