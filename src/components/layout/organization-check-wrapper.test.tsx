import { OrganizationCheckWrapper } from '@components/layout/organization-check-wrapper';
import { buildBackendUrl } from '@lib/test.utils';
import { renderWithProviders } from '@lib/test-wrappers.utils';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { Suspense } from 'react';
import { server } from '@/../testsSetup';
import type { paths } from '@/types/api.generated.types';

type ListOrganizationsSuccessResponse =
  paths['/api/v1/organizations']['get']['responses']['200']['content']['application/json'];

function overrideListOrganizationsHandler(
  results: ListOrganizationsSuccessResponse['responseData']['results'],
) {
  server.use(
    http.get<never, never, ListOrganizationsSuccessResponse>(
      buildBackendUrl('/api/v1/organizations'),
      () => {
        return HttpResponse.json({
          responseData: {
            results,
            hasNext: false,
            hasPrevious: false,
            totalResults: results.length,
            totalPages: results.length > 0 ? 1 : 0,
            page: 1,
            size: 100,
          },
          responseErrors: null,
        });
      },
    ),
  );
}

function renderWrapper() {
  return renderWithProviders(
    <Suspense fallback={<div>Loading...</div>}>
      <OrganizationCheckWrapper>
        <div data-testid="child-content">Child Content</div>
      </OrganizationCheckWrapper>
    </Suspense>,
  );
}

describe('OrganizationCheckWrapper', () => {
  it('should render children when user has organizations', async () => {
    renderWrapper();

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    expect(screen.getByTestId('child-content')).toBeInTheDocument();
    expect(screen.queryByText('Welcome!')).not.toBeInTheDocument();
  });

  it('should show create organization modal when user has no organizations', async () => {
    overrideListOrganizationsHandler([]);

    renderWrapper();

    await waitFor(() => {
      expect(screen.getByText('Welcome!')).toBeInTheDocument();
    });

    expect(screen.getByTestId('child-content')).toBeInTheDocument();
  });

  it('should always render children regardless of organization status', async () => {
    overrideListOrganizationsHandler([]);

    renderWrapper();

    await waitFor(() => {
      expect(screen.getByText('Welcome!')).toBeInTheDocument();
    });

    expect(screen.getByTestId('child-content')).toBeInTheDocument();
  });

  it('should show modal when responseData is null', async () => {
    server.use(
      http.get<never, never, ListOrganizationsSuccessResponse>(
        buildBackendUrl('/api/v1/organizations'),
        () => {
          return HttpResponse.json({
            responseData: null,
            responseErrors: null,
          } as unknown as ListOrganizationsSuccessResponse);
        },
      ),
    );

    renderWrapper();

    await waitFor(() => {
      expect(screen.getByText('Welcome!')).toBeInTheDocument();
    });

    expect(screen.getByTestId('child-content')).toBeInTheDocument();
  });

  it('should close modal and invalidate queries after organization is created', async () => {
    const user = userEvent.setup();

    overrideListOrganizationsHandler([]);

    renderWrapper();

    await waitFor(() => {
      expect(screen.getByText('Welcome!')).toBeInTheDocument();
    });

    const nameInput = screen.getByLabelText(/Organization Name/);
    await user.type(nameInput, 'My New Org');

    const slugInput = screen.getByLabelText(/Organization Slug/);
    await user.clear(slugInput);
    await user.type(slugInput, 'my-new-org');

    const checkButton = screen.getByRole('button', {
      name: 'Check Availability',
    });
    await user.click(checkButton);

    await waitFor(() => {
      expect(screen.getByText(/Slug is available/)).toBeInTheDocument();
    });

    const submitButton = screen.getByRole('button', {
      name: 'Create Organization',
    });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.queryByText('Welcome!')).not.toBeInTheDocument();
    });
  });
});
