import { OrganizationCheckWrapper } from '@domains/shared/components/organization-check-wrapper';
import { buildBackendUrl } from '@lib/test-backend-url.utils';
import { renderWithProviders } from '@lib/test-wrappers.utils';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { Suspense } from 'react';
import { describe, expect, it } from 'vitest';
import { server } from '@/../testsSetup';
import type { paths } from '@/types/api.generated.types';

type ListOrganizationsSuccessResponse =
  paths['/api/v1/organizations']['get']['responses']['200']['content']['application/json'];

describe('OrganizationCheckWrapper', () => {
  it('should render children when user has organizations', async () => {
    // Default MSW handler returns organizations
    renderWithProviders(
      <Suspense fallback={<div>Loading...</div>}>
        <OrganizationCheckWrapper>
          <div>Child Content</div>
        </OrganizationCheckWrapper>
      </Suspense>,
    );

    await waitFor(() => {
      expect(screen.getByText('Child Content')).toBeInTheDocument();
    });
    expect(screen.queryByText('Welcome!')).not.toBeInTheDocument();
  });

  it('should show modal when user has no organizations', async () => {
    // Override MSW handler to return empty organizations
    server.use(
      http.get<never, never, ListOrganizationsSuccessResponse>(
        buildBackendUrl('/api/v1/organizations'),
        () => {
          return HttpResponse.json({
            responseData: {
              results: [],
              hasNext: false,
              hasPrevious: false,
              totalResults: 0,
              totalPages: 0,
              page: 1,
              size: 100,
            },
            responseErrors: null,
          });
        },
      ),
    );

    renderWithProviders(
      <OrganizationCheckWrapper>
        <div>Child Content</div>
      </OrganizationCheckWrapper>,
    );

    await waitFor(() => {
      expect(screen.getByText('Welcome!')).toBeInTheDocument();
    });
    expect(
      screen.getByText(
        /Before you can continue, you need to create an organization/,
      ),
    ).toBeInTheDocument();
  });

  it('should render children even when modal is shown', async () => {
    // Override MSW handler to return empty organizations
    server.use(
      http.get<never, never, ListOrganizationsSuccessResponse>(
        buildBackendUrl('/api/v1/organizations'),
        () => {
          return HttpResponse.json({
            responseData: {
              results: [],
              hasNext: false,
              hasPrevious: false,
              totalResults: 0,
              totalPages: 0,
              page: 1,
              size: 100,
            },
            responseErrors: null,
          });
        },
      ),
    );

    renderWithProviders(
      <Suspense fallback={<div>Loading...</div>}>
        <OrganizationCheckWrapper>
          <div>Child Content</div>
        </OrganizationCheckWrapper>
      </Suspense>,
    );

    // Both should be rendered, children are always shown
    await waitFor(() => {
      expect(screen.getByText('Child Content')).toBeInTheDocument();
    });
  });

  it('should show modal when responseData results is null', async () => {
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

    renderWithProviders(
      <Suspense fallback={<div>Loading...</div>}>
        <OrganizationCheckWrapper>
          <div>Child Content</div>
        </OrganizationCheckWrapper>
      </Suspense>,
    );

    await waitFor(() => {
      expect(screen.getByText('Welcome!')).toBeInTheDocument();
    });
  });

  it('should close modal and invalidate queries when organization is created', async () => {
    const user = userEvent.setup();

    server.use(
      http.get<never, never, ListOrganizationsSuccessResponse>(
        buildBackendUrl('/api/v1/organizations'),
        () => {
          return HttpResponse.json({
            responseData: {
              results: [],
              hasNext: false,
              hasPrevious: false,
              totalResults: 0,
              totalPages: 0,
              page: 1,
              size: 100,
            },
            responseErrors: null,
          });
        },
      ),
    );

    renderWithProviders(
      <Suspense fallback={<div>Loading...</div>}>
        <OrganizationCheckWrapper>
          <div>Child Content</div>
        </OrganizationCheckWrapper>
      </Suspense>,
    );

    // Wait for modal to appear
    await waitFor(() => {
      expect(screen.getByText('Welcome!')).toBeInTheDocument();
    });

    // Fill org name
    const nameInput = screen.getByLabelText(/Organization Name/);
    await user.type(nameInput, 'My Test Org');

    // Wait for auto-generated slug
    await waitFor(() => {
      expect(screen.getByLabelText(/Organization Slug/)).toHaveValue(
        'my-test-org',
      );
    });

    // Check slug availability
    await user.click(
      screen.getByRole('button', { name: 'Check Availability' }),
    );

    await waitFor(() => {
      expect(screen.getByText(/Slug is available/)).toBeInTheDocument();
    });

    // Submit form
    await user.click(
      screen.getByRole('button', { name: 'Create Organization' }),
    );

    // handleOrganizationCreated should fire: modal closes
    await waitFor(() => {
      expect(screen.queryByText('Welcome!')).not.toBeInTheDocument();
    });
  });

  it('should not show modal when user has a real organization', async () => {
    // Default MSW handler returns organizations
    renderWithProviders(
      <Suspense fallback={<div>Loading...</div>}>
        <OrganizationCheckWrapper>
          <div>Child Content</div>
        </OrganizationCheckWrapper>
      </Suspense>,
    );

    await waitFor(() => {
      expect(screen.getByText('Child Content')).toBeInTheDocument();
    });
    expect(screen.queryByText('Welcome!')).not.toBeInTheDocument();
  });
});
