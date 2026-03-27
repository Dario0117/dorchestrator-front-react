import { ProfilePage } from '@domains/org/pages/profile.page';
import { env } from '@lib/env.utils';
import { renderWithProviders } from '@lib/test-wrappers.utils';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { Suspense } from 'react';
import { server } from '@/../testsSetup';

describe('ProfilePage', () => {
  it('renders page title and description', async () => {
    renderWithProviders(
      <Suspense fallback={<div>Loading...</div>}>
        <ProfilePage />
      </Suspense>,
    );
    await waitFor(() => {
      expect(screen.getByText('Profile')).toBeInTheDocument();
    });
    expect(
      screen.getByText('Manage your account and security settings'),
    ).toBeInTheDocument();
  });

  it('renders account details card with profile data', async () => {
    renderWithProviders(
      <Suspense fallback={<div>Loading...</div>}>
        <ProfilePage />
      </Suspense>,
    );
    await waitFor(() => {
      expect(screen.getByText('Account Details')).toBeInTheDocument();
    });
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });

  it('renders name and email labels', async () => {
    renderWithProviders(
      <Suspense fallback={<div>Loading...</div>}>
        <ProfilePage />
      </Suspense>,
    );
    await waitFor(() => {
      expect(screen.getByText('Name')).toBeInTheDocument();
    });
    expect(screen.getByText('Email')).toBeInTheDocument();
  });

  it('renders change password form', async () => {
    renderWithProviders(
      <Suspense fallback={<div>Loading...</div>}>
        <ProfilePage />
      </Suspense>,
    );
    await waitFor(() => {
      expect(screen.getByText('Change Password')).toBeInTheDocument();
    });
  });

  it('shows success alert after password is changed successfully', async () => {
    server.use(
      http.post(`${env.BACKEND_BASE_URL}/api/v1/change-password`, () => {
        return HttpResponse.json({});
      }),
    );

    const user = userEvent.setup();

    renderWithProviders(
      <Suspense fallback={<div>Loading...</div>}>
        <ProfilePage />
      </Suspense>,
    );

    await waitFor(() => {
      expect(screen.getByText('Change Password')).toBeInTheDocument();
    });

    const currentPasswordInput =
      screen.getByPlaceholderText('Current password');
    const newPasswordInput = screen.getByPlaceholderText('New password');
    const confirmInput = screen.getByPlaceholderText('Confirm new password');

    await user.type(currentPasswordInput, 'OldPassword123!');
    await user.type(newPasswordInput, 'NewPassword123!');
    await user.type(confirmInput, 'NewPassword123!');

    const submitButton = screen.getByRole('button', {
      name: /change password/i,
    });
    await user.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText('Your password has been changed successfully.'),
      ).toBeInTheDocument();
    });
  });
});
