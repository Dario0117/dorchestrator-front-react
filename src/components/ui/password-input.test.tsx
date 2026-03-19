import { PasswordInput } from '@components/ui/password-input';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('PasswordInput', () => {
  it('should render with password masked by default', () => {
    render(<PasswordInput placeholder="Enter password" />);
    const input = screen.getByPlaceholderText('Enter password');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('type', 'password');
  });

  it('should render toggle button with correct initial icon', () => {
    render(<PasswordInput />);
    const toggleButton = screen.getByRole('button', {
      name: 'Show password',
    });
    expect(toggleButton).toBeInTheDocument();

    // Eye icon should be visible initially (password hidden)
    const eyeIcon = toggleButton.querySelector('svg');
    expect(eyeIcon).toBeInTheDocument();
  });

  it('should toggle password visibility when button is clicked', async () => {
    const user = userEvent.setup();
    render(<PasswordInput placeholder="Enter password" />);

    const input = screen.getByPlaceholderText('Enter password');
    const toggleButton = screen.getByRole('button', {
      name: 'Show password',
    });

    // Initially password type
    expect(input).toHaveAttribute('type', 'password');

    // Click to show password
    await user.click(toggleButton);
    expect(input).toHaveAttribute('type', 'text');
    expect(
      screen.getByRole('button', { name: 'Hide password' }),
    ).toBeInTheDocument();

    // Click again to hide password
    await user.click(toggleButton);
    expect(input).toHaveAttribute('type', 'password');
    expect(
      screen.getByRole('button', { name: 'Show password' }),
    ).toBeInTheDocument();
  });

  it('should maintain input value when toggling visibility', async () => {
    const user = userEvent.setup();
    render(<PasswordInput placeholder="Enter password" />);

    const input = screen.getByPlaceholderText('Enter password');
    const toggleButton = screen.getByRole('button', {
      name: 'Show password',
    });

    // Type password
    await user.type(input, 'SecurePassword123');
    expect(input).toHaveValue('SecurePassword123');

    // Toggle visibility
    await user.click(toggleButton);
    expect(input).toHaveValue('SecurePassword123');
    expect(input).toHaveAttribute('type', 'text');

    // Toggle back
    await user.click(toggleButton);
    expect(input).toHaveValue('SecurePassword123');
    expect(input).toHaveAttribute('type', 'password');
  });

  it('should forward all standard input props', () => {
    render(
      <PasswordInput
        placeholder="Enter your password"
        disabled={false}
        name="password"
        id="password-field"
        aria-describedby="password-help"
      />,
    );

    const input = screen.getByPlaceholderText('Enter your password');
    expect(input).toHaveAttribute('name', 'password');
    expect(input).toHaveAttribute('id', 'password-field');
    expect(input).toHaveAttribute('aria-describedby', 'password-help');
  });

  it('should handle disabled state', () => {
    render(
      <PasswordInput
        disabled
        placeholder="Enter password"
      />,
    );
    const input = screen.getByPlaceholderText('Enter password');
    expect(input).toBeDisabled();
  });

  it('should have accessible toggle button with correct attributes', () => {
    render(<PasswordInput />);
    const toggleButton = screen.getByRole('button', {
      name: 'Show password',
    });

    expect(toggleButton).toHaveAttribute('type', 'button');
    expect(toggleButton).toHaveAttribute('tabIndex', '-1');
    expect(toggleButton).toHaveAttribute('aria-label', 'Show password');
  });

  it('should update aria-label when toggling visibility', async () => {
    const user = userEvent.setup();
    render(<PasswordInput />);

    let toggleButton = screen.getByRole('button', { name: 'Show password' });
    expect(toggleButton).toHaveAttribute('aria-label', 'Show password');

    await user.click(toggleButton);
    toggleButton = screen.getByRole('button', { name: 'Hide password' });
    expect(toggleButton).toHaveAttribute('aria-label', 'Hide password');
  });

  it('should allow keyboard interaction on toggle button', async () => {
    const user = userEvent.setup();
    render(<PasswordInput placeholder="Enter password" />);

    const input = screen.getByPlaceholderText('Enter password');
    const toggleButton = screen.getByRole('button', {
      name: 'Show password',
    });

    // Focus the toggle button
    toggleButton.focus();
    expect(toggleButton).toHaveFocus();

    // Press Enter to toggle
    await user.keyboard('{Enter}');
    expect(input).toHaveAttribute('type', 'text');
  });

  it('should handle onChange events correctly', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    const { container } = render(<PasswordInput onChange={handleChange} />);
    const input = container.querySelector('input');

    if (!input) {
      throw new Error('Input not found');
    }
    await user.type(input, 'test');
    expect(handleChange).toHaveBeenCalledTimes(4); // Once per character
  });

  it('should render with controlled value', () => {
    const { rerender, container } = render(
      <PasswordInput
        value="initial"
        readOnly
      />,
    );
    const input = container.querySelector('input');
    expect(input).toHaveValue('initial');

    rerender(
      <PasswordInput
        value="updated"
        readOnly
      />,
    );
    expect(input).toHaveValue('updated');
  });
});
