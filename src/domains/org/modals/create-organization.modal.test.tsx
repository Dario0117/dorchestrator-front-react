import { CreateOrganizationModal } from '@domains/org/modals/create-organization.modal';
import { renderWithProviders } from '@lib/test-wrappers.utils';
import { act, screen } from '@testing-library/react';
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

  it('should prevent pointer down outside from closing the modal', () => {
    vi.useFakeTimers();

    renderWithProviders(
      <CreateOrganizationModal
        isOpen={true}
        onSuccess={mockOnSuccess}
      />,
    );

    // Radix registers its pointerdown listener on the document in a setTimeout(, 0)
    // Advance timers so the listener is active
    act(() => {
      vi.runAllTimers();
    });

    const overlay = document.querySelector('[data-slot="dialog-overlay"]');
    expect(overlay).toBeInTheDocument();

    // Dispatch pointerdown on the overlay (outside dialog content) to trigger Radix's handler
    // The onPointerDownOutside callback calls e.preventDefault() to keep the modal open
    act(() => {
      overlay?.dispatchEvent(new Event('pointerdown', { bubbles: true }));
    });

    // Modal should still be visible because e.preventDefault() was called
    expect(screen.getByText('Welcome!')).toBeInTheDocument();

    vi.useRealTimers();
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

  it('should call onSuccess when form submission succeeds', async () => {
    const { waitFor } = await import('@testing-library/react');
    const user = userEvent.setup();
    renderWithProviders(
      <CreateOrganizationModal
        isOpen={true}
        onSuccess={mockOnSuccess}
      />,
    );

    // Fill in the organization name
    const nameInput = screen.getByLabelText(/Organization Name/);
    await user.type(nameInput, 'My Test Org');

    // Wait for auto-generated slug
    await waitFor(() => {
      const slugInput = screen.getByLabelText(/Organization Slug/);
      expect(slugInput).toHaveValue('my-test-org');
    });

    // Check slug availability first (required for submit to be enabled)
    const checkButton = screen.getByRole('button', {
      name: 'Check Availability',
    });
    await user.click(checkButton);

    await waitFor(() => {
      expect(screen.getByText(/Slug is available/)).toBeInTheDocument();
    });

    // Submit the form
    const submitButton = screen.getByRole('button', {
      name: 'Create Organization',
    });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalledTimes(1);
    });
  });
});
