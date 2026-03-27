import { renderWithProviders } from '@lib/test-wrappers.utils';
import { screen } from '@testing-library/react';
import { OrgDetailsCard } from './org-details-card';

describe('OrgDetailsCard', () => {
  it('renders card title', () => {
    renderWithProviders(
      <OrgDetailsCard
        name="My Org"
        id="org-123"
      />,
    );
    expect(screen.getByText('Organization Details')).toBeInTheDocument();
  });

  it('displays organization name', () => {
    renderWithProviders(
      <OrgDetailsCard
        name="My Org"
        id="org-123"
      />,
    );
    expect(screen.getByText('My Org')).toBeInTheDocument();
  });

  it('displays organization ID', () => {
    renderWithProviders(
      <OrgDetailsCard
        name="My Org"
        id="org-123"
      />,
    );
    expect(screen.getByText('org-123')).toBeInTheDocument();
  });

  it('formats and displays creation date', () => {
    renderWithProviders(
      <OrgDetailsCard
        name="My Org"
        id="org-123"
        createdAt="2025-06-15T10:00:00.000Z"
      />,
    );
    expect(
      screen.getByText(
        new Date('2025-06-15T10:00:00.000Z').toLocaleDateString(),
      ),
    ).toBeInTheDocument();
  });

  it('displays N/A when createdAt is null', () => {
    renderWithProviders(
      <OrgDetailsCard
        name="My Org"
        id="org-123"
        createdAt={null}
      />,
    );
    expect(screen.getByText('N/A')).toBeInTheDocument();
  });
});
