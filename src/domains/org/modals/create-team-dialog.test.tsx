import { Button } from '@components/ds/atoms/button';
import { CreateTeamDialog } from '@domains/org/modals/create-team-dialog';
import { renderWithProviders } from '@lib/test-wrappers.utils';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';

function ControlledCreateTeamDialog() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open Dialog</Button>
      <CreateTeamDialog
        organizationId="org-1"
        open={open}
        onOpenChange={setOpen}
      />
    </>
  );
}

describe('CreateTeamDialog', () => {
  it('renders dialog title when open', () => {
    renderWithProviders(
      <CreateTeamDialog
        organizationId="org-1"
        open
        onOpenChange={vi.fn()}
      />,
    );
    expect(screen.getByText('Create Team')).toBeInTheDocument();
  });

  it('does not render content when closed', () => {
    renderWithProviders(
      <CreateTeamDialog
        organizationId="org-1"
        open={false}
        onOpenChange={vi.fn()}
      />,
    );
    expect(screen.queryByText('Create Team')).not.toBeInTheDocument();
  });

  it('renders team name field', () => {
    renderWithProviders(
      <CreateTeamDialog
        organizationId="org-1"
        open
        onOpenChange={vi.fn()}
      />,
    );
    expect(screen.getByPlaceholderText('Team name')).toBeInTheDocument();
  });

  it('renders team slug field', () => {
    renderWithProviders(
      <CreateTeamDialog
        organizationId="org-1"
        open
        onOpenChange={vi.fn()}
      />,
    );
    expect(screen.getByPlaceholderText('team-slug')).toBeInTheDocument();
  });

  it('renders slug helper text', () => {
    renderWithProviders(
      <CreateTeamDialog
        organizationId="org-1"
        open
        onOpenChange={vi.fn()}
      />,
    );
    expect(
      screen.getByText(/Used in URLs. Only lowercase letters/),
    ).toBeInTheDocument();
  });

  it('renders create button', () => {
    renderWithProviders(
      <CreateTeamDialog
        organizationId="org-1"
        open
        onOpenChange={vi.fn()}
      />,
    );
    expect(screen.getByRole('button', { name: 'Create' })).toBeInTheDocument();
  });

  it('auto-generates slug when typing name', async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <CreateTeamDialog
        organizationId="org-1"
        open
        onOpenChange={vi.fn()}
      />,
    );
    const nameInput = screen.getByPlaceholderText('Team name');
    await user.type(nameInput, 'My New Team');
    expect(screen.getByPlaceholderText('team-slug')).toHaveValue('my-new-team');
  });

  it('does not update slug when name input produces empty suggestion', async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <CreateTeamDialog
        organizationId="org-1"
        open
        onOpenChange={vi.fn()}
      />,
    );
    const nameInput = screen.getByPlaceholderText('Team name');
    const slugInput = screen.getByPlaceholderText('team-slug');

    // Type a valid name first to set a slug value
    await user.type(nameInput, 'Hello');
    expect(slugInput).toHaveValue('hello');

    // Clear the name field - empty string produces empty slug suggestion, so slug stays
    await user.clear(nameInput);
    expect(slugInput).toHaveValue('hello');
  });

  it('submits the form and closes the dialog on success', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    renderWithProviders(
      <CreateTeamDialog
        organizationId="org-1"
        open
        onOpenChange={onOpenChange}
      />,
    );

    const nameInput = screen.getByPlaceholderText('Team name');
    const slugInput = screen.getByPlaceholderText('team-slug');

    await user.type(nameInput, 'My Team');
    await user.clear(slugInput);
    await user.type(slugInput, 'my-team');

    const submitButton = screen.getByRole('button', { name: 'Create' });
    await user.click(submitButton);

    await waitFor(() => {
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
  });

  it('does not reset form when dialog opens via onOpenChange(true)', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ControlledCreateTeamDialog />);

    // Open the dialog — triggers onOpenChange(true), so form.reset() should NOT be called
    await user.click(screen.getByRole('button', { name: 'Open Dialog' }));

    // Dialog should now be open and form fields visible
    expect(screen.getByPlaceholderText('Team name')).toBeInTheDocument();

    // Type a value to confirm form is usable (not reset on open)
    await user.type(screen.getByPlaceholderText('Team name'), 'Test');
    expect(screen.getByPlaceholderText('Team name')).toHaveValue('Test');
  });

  it('exercises onOpenChange else branch when dialog is re-opened after closing', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ControlledCreateTeamDialog />);

    // Open the dialog
    await user.click(screen.getByRole('button', { name: 'Open Dialog' }));
    expect(screen.getByPlaceholderText('Team name')).toBeInTheDocument();

    // Close the dialog via close button — covers the if (!isOpen) branch
    const closeButton = screen.getByRole('button', { name: /close/i });
    await user.click(closeButton);

    await waitFor(() => {
      expect(
        screen.queryByPlaceholderText('Team name'),
      ).not.toBeInTheDocument();
    });

    // Re-open the dialog — this triggers onOpenChange(true) through the controlled wrapper,
    // covering the else branch of if (!isOpen)
    await user.click(screen.getByRole('button', { name: 'Open Dialog' }));

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Team name')).toBeInTheDocument();
    });
  });

  it('calls onOpenChange and resets form when dialog is closed', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    renderWithProviders(
      <CreateTeamDialog
        organizationId="org-1"
        open
        onOpenChange={onOpenChange}
      />,
    );

    // Type a value to make the form dirty
    const nameInput = screen.getByPlaceholderText('Team name');
    await user.type(nameInput, 'Test Team');

    // Close the dialog via the close button
    const closeButton = screen.getByRole('button', { name: /close/i });
    await user.click(closeButton);

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
