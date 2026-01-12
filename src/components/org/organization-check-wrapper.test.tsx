import { OrganizationCheckWrapper } from '@components/layout/organization-check-wrapper';
import { renderWithProviders } from '@lib/test-wrappers.utils';
import { useOrganizationStore } from '@stores/organization.store';
import { DEFAULT_ORGANIZATION_ID } from '@stores/organization.store.constants';
import { screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

describe('OrganizationCheckWrapper', () => {
  it('should render children when user has organizations', () => {
    // Seed the store with a real organization
    useOrganizationStore.getState().setOrganizations([
      {
        id: 'org-123',
        name: 'Test Organization',
        slug: 'test-org',
        createdAt: new Date('2025-12-21T10:00:00.000Z'),
      },
    ]);

    renderWithProviders(
      <OrganizationCheckWrapper>
        <div>Child Content</div>
      </OrganizationCheckWrapper>,
    );

    expect(screen.getByText('Child Content')).toBeInTheDocument();
    expect(screen.queryByText('Welcome!')).not.toBeInTheDocument();
  });

  it('should show modal when user has no organizations', async () => {
    // Reset store to default state (no real organizations)
    const store = useOrganizationStore.getState();
    store.setOrganizations([]);
    // Manually set to default organization since setOrganizations doesn't reset it
    store.setCurrentOrganization({
      id: DEFAULT_ORGANIZATION_ID,
      name: 'Dorchestrator',
      slug: 'dorchestrator',
      createdAt: new Date(),
    });

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

  it('should render children even when modal is shown', () => {
    // Reset store to default state
    const store = useOrganizationStore.getState();
    store.setOrganizations([]);
    store.setCurrentOrganization({
      id: DEFAULT_ORGANIZATION_ID,
      name: 'Dorchestrator',
      slug: 'dorchestrator',
      createdAt: new Date(),
    });

    renderWithProviders(
      <OrganizationCheckWrapper>
        <div>Child Content</div>
      </OrganizationCheckWrapper>,
    );

    // Both should be rendered, children are always shown
    expect(screen.getByText('Child Content')).toBeInTheDocument();
  });

  it('should not show modal when user has a real organization', () => {
    // Seed the store with a different organization
    useOrganizationStore.getState().setOrganizations([
      {
        id: 'org-456',
        name: 'Another Organization',
        slug: 'another-org',
        createdAt: new Date('2025-12-21T10:00:00.000Z'),
      },
    ]);

    renderWithProviders(
      <OrganizationCheckWrapper>
        <div>Child Content</div>
      </OrganizationCheckWrapper>,
    );

    expect(screen.getByText('Child Content')).toBeInTheDocument();
    expect(screen.queryByText('Welcome!')).not.toBeInTheDocument();
  });
});
