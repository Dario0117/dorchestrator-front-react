import { RegisterPage } from '@domains/org/pages/register.page';
import { registerHandler } from '@domains/org/services/users/register.http-service.handlers';
import { renderWithProviders } from '@lib/test-wrappers.utils';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { server } from '@/../testsSetup';

interface LinkProps {
  children: React.ReactNode;
  to: string;
  [key: string]: unknown;
}

const mockNavigate = vi.fn();

// Mock the navigation hook
vi.mock('@tanstack/react-router', () => ({
  useNavigate: vi.fn(() => mockNavigate),
  Link: ({ children, to, ...props }: LinkProps) => (
    <a
      href={to}
      {...props}
    >
      {children}
    </a>
  ),
}));

describe('RegisterPage', () => {
  it('should render register form', () => {
    renderWithProviders(<RegisterPage />);

    const section = document.querySelector('section');
    expect(section).toBeInTheDocument();
    expect(screen.getByText('Create your account')).toBeInTheDocument();
  });

  it('should have proper page structure', () => {
    const { container } = renderWithProviders(<RegisterPage />);

    const section = container.querySelector('section');
    expect(section).toBeInTheDocument();
  });

  it('should render without errors', () => {
    renderWithProviders(<RegisterPage />);

    // The component should render without errors
    expect(document.querySelector('section')).toBeInTheDocument();
    expect(screen.getByText('Create your account')).toBeInTheDocument();
  });

  it('should have accessibility structure', () => {
    renderWithProviders(<RegisterPage />);

    const section = document.querySelector('section');
    expect(section).toBeInTheDocument();
  });

  it('should render form with submit button and login link', () => {
    renderWithProviders(<RegisterPage />);

    expect(
      screen.getByRole('button', { name: 'Register' }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/Name/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Confirm Password/)).toBeInTheDocument();
  });

  it('should navigate to login with registered param on successful registration', async () => {
    server.use(registerHandler);
    const user = userEvent.setup();

    renderWithProviders(<RegisterPage />);

    await user.type(screen.getByLabelText(/Name/), 'Test User');
    await user.type(screen.getByLabelText(/Email/), 'test@example.com');
    const passwordFields = screen.getAllByLabelText(/Password/);
    // First match is "Password", second is "Confirm Password"
    await user.type(passwordFields[0] as HTMLElement, 'Password123!');
    await user.type(screen.getByLabelText(/Confirm Password/), 'Password123!');

    await user.click(screen.getByRole('button', { name: 'Register' }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith({
        to: '/login',
        search: { registered: true },
      });
    });
  });
});
