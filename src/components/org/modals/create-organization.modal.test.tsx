import { CreateOrganizationModal } from '@components/org/modals/create-organization.modal';
import { renderWithProviders } from '@lib/test-wrappers.utils';
import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

describe('CreateOrganizationModal', () => {
  const mockOnSuccess = vi.fn();

  beforeEach(() => {
    mockOnSuccess.mockClear();
  });

  it('should render modal when isOpen is true', () => {
    renderWithProviders(
      <CreateOrganizationModal
        isOpen={true}
        onSuccess={mockOnSuccess}
      />,
    );

    expect(screen.getByText('Welcome!')).toBeInTheDocument();
    expect(
      screen.getByText(
        /Before you can continue, you need to create an organization/,
      ),
    ).toBeInTheDocument();
  });

  it('should not render modal when isOpen is false', () => {
    renderWithProviders(
      <CreateOrganizationModal
        isOpen={false}
        onSuccess={mockOnSuccess}
      />,
    );

    expect(screen.queryByText('Welcome!')).not.toBeInTheDocument();
  });

  it('should display modal title and description', () => {
    renderWithProviders(
      <CreateOrganizationModal
        isOpen={true}
        onSuccess={mockOnSuccess}
      />,
    );

    expect(screen.getByText('Welcome!')).toBeInTheDocument();
    expect(
      screen.getByText(
        /This will be your workspace for managing devices, commands and more/,
      ),
    ).toBeInTheDocument();
  });
});
