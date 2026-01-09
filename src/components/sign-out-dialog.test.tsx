import { SignOutDialog } from '@components/sign-out-dialog';
import { renderWithProviders } from '@lib/test-wrappers.utils';
import { useAuthenticationStore } from '@stores/authentication.store';
import { act, renderHook, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

describe('SignOutDialog', () => {
  const mockOnOpenChange = vi.fn();

  beforeEach(() => {
    mockOnOpenChange.mockClear();
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

  it('should trigger logout when sign out button is clicked', async () => {
    const { result: res } = renderHook(() => useAuthenticationStore());
    const profile = {
      id: 'test-user-id',
      createdAt: new Date(),
      updatedAt: new Date(),
      email: 'test@example.com',
      emailVerified: true,
      name: 'Test User',
      image: null,
    };
    act(() => {
      res.current.setProfile(profile);
    });
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

    const { result: preLogoutResult } = renderHook(() =>
      useAuthenticationStore(),
    );
    expect(preLogoutResult.current.profile).toBe(profile);
    await user.click(signOutButton);
    const { result } = renderHook(() => useAuthenticationStore());

    expect(result.current.profile).toBeUndefined();
  });
});
