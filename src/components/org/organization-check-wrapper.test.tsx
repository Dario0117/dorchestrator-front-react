import { OrganizationCheckWrapper } from '@components/layout/organization-check-wrapper';
import { buildBackendUrl } from '@lib/test.utils';
import { renderWithProviders } from '@lib/test-wrappers.utils';
import { screen, waitFor } from '@testing-library/react';
import { HttpResponse, http } from 'msw';
import { Suspense } from 'react';
import { describe, expect, it } from 'vitest';
import { server } from '@/../testsSetup';
import type { paths } from '@/types/api.generated.types';

type ListOrganizationsSuccessResponse =
  paths['/api/v1/organization/list']['get']['responses']['200']['content']['application/json'];

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
        buildBackendUrl('/api/v1/organization/list'),
        () => {
          return HttpResponse.json([]);
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
        buildBackendUrl('/api/v1/organization/list'),
        () => {
          return HttpResponse.json([]);
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
