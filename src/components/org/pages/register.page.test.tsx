import { RegisterPage } from '@components/org/pages/register.page';
import { renderWithProviders } from '@lib/test-wrappers.utils';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

interface LinkProps {
  children: React.ReactNode;
  to: string;
  [key: string]: unknown;
}

// Mock the navigation hook
vi.mock('@tanstack/react-router', () => ({
  useNavigate: vi.fn(),
  Link: ({ children, to, ...props }: LinkProps) => (
    <a
      href={to}
      {...props}
    >
      {children}
    </a>
  ),
}));

const mockUseNavigate = vi.mocked(
  await import('@tanstack/react-router'),
).useNavigate;

const mockNavigate = vi.fn();
mockUseNavigate.mockReturnValue(mockNavigate);

describe('RegisterPage', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('should render register form', () => {
    renderWithProviders(<RegisterPage />);

    // Check that the register form is rendered
    const section = document.querySelector('section');
    expect(section).toBeInTheDocument();
    expect(section).toHaveClass(
      'flex',
      'min-h-svh',
      'w-full',
      'items-center',
      'justify-center',
      'p-6',
      'md:p-10',
    );
  });

  it('should have proper page structure', () => {
    const { container } = renderWithProviders(<RegisterPage />);

    const section = container.querySelector('section');
    expect(section).toBeInTheDocument();

    const wrapper = container.querySelector('.w-full.max-w-sm');
    expect(wrapper).toBeInTheDocument();
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

  it('should navigate to login page on successful registration', async () => {
    const user = userEvent.setup();
    renderWithProviders(<RegisterPage />);

    // Fill in the registration form
    const nameInput = screen.getByLabelText(/Name/);
    const emailInput = screen.getByLabelText(/Email/);
    const passwordInput = screen.getByPlaceholderText('Password');
    const confirmPasswordInput = screen.getByLabelText(/Confirm Password/);
    const submitButton = screen.getByRole('button', { name: 'Register' });

    await user.type(nameInput, 'Test User');
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.type(confirmPasswordInput, 'password123');
    await user.click(submitButton);

    // Wait for the mutation to complete and navigation to occur
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith({
        to: '/login',
        search: { registered: true },
      });
    });
  });
});
