import { CreateOrganizationModal } from '@components/org/modals/create-organization.modal';
import { renderWithProviders } from '@lib/test-wrappers.utils';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

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

  it('should render CreateOrganizationForm inside the modal', () => {
    renderWithProviders(
      <CreateOrganizationModal
        isOpen={true}
        onSuccess={mockOnSuccess}
      />,
    );

    expect(screen.getByText('Create Your Organization')).toBeInTheDocument();
    expect(screen.getByLabelText(/Organization Name/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Organization Slug/)).toBeInTheDocument();
  });

  it('should not close on escape key press', async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <CreateOrganizationModal
        isOpen={true}
        onSuccess={mockOnSuccess}
      />,
    );

    await user.keyboard('{Escape}');

    // Modal should still be visible
    expect(screen.getByText('Welcome!')).toBeInTheDocument();
  });

  it('should not close when clicking outside the modal', async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <CreateOrganizationModal
        isOpen={true}
        onSuccess={mockOnSuccess}
      />,
    );

    // Click on the overlay (outside the dialog content)
    const dialog = screen.getByRole('dialog');
    await user.click(dialog);

    // Modal should still be visible
    expect(screen.getByText('Welcome!')).toBeInTheDocument();
  });

  it('should not show close button', () => {
    renderWithProviders(
      <CreateOrganizationModal
        isOpen={true}
        onSuccess={mockOnSuccess}
      />,
    );

    // There should be no close button (showCloseButton={false})
    const closeButton = screen
      .getByRole('dialog')
      .querySelector('button[data-slot="dialog-close"]');
    expect(closeButton).not.toBeInTheDocument();
  });
});
