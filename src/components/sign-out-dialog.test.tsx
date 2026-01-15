import { SignOutDialog } from '@components/sign-out-dialog';
import { renderWithProviders } from '@lib/test-wrappers.utils';
import { screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

describe('SignOutDialog', () => {
  const mockOnOpenChange = vi.fn();
  let originalLocation: Location;

  beforeEach(() => {
    mockOnOpenChange.mockClear();
    originalLocation = window.location;
    delete (window as { location?: Location }).location;
    window.location = { ...originalLocation, href: '' } as Location;
  });

  afterEach(() => {
    window.location = originalLocation;
  });

  it('should render dialog with title and description', () => {
    const { baseElement } = renderWithProviders(
      <SignOutDialog
        open={true}
        onOpenChange={mockOnOpenChange}
      />,
    );
    // Dialog renders in portal, check in document body
    expect(baseElement.textContent).toContain('Sign out');
    expect(baseElement.textContent).toContain(
      'Are you sure you want to sign out?',
    );
  });

  it('should render cancel button', () => {
    renderWithProviders(
      <SignOutDialog
        open={true}
        onOpenChange={mockOnOpenChange}
      />,
    );
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('should trigger logout and redirect to login page when sign out button is clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <SignOutDialog
        open={true}
        onOpenChange={mockOnOpenChange}
      />,
    );

    const signOutButtons = screen.getAllByText('Sign out');
    const signOutButton = signOutButtons[1];
    if (!signOutButton) {
      throw new Error('Sign out button not found');
    }

    await user.click(signOutButton);

    // Wait for the mutation to complete and page redirect
    await waitFor(() => {
      expect(window.location.href).toBe('/login');
    });
  });
});
