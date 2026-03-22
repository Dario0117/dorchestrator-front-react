import { render, screen } from '@testing-library/react';
import { act } from 'react';
import { PasswordInput } from './password-input';

describe('PasswordInput', () => {
  describe('rendering', () => {
    it('renders password input', () => {
      render(<PasswordInput placeholder="Enter password" />);
      expect(screen.getByPlaceholderText('Enter password')).toBeInTheDocument();
    });

    it('renders toggle visibility button', () => {
      render(<PasswordInput />);
      expect(
        screen.getByRole('button', { name: 'Show password' }),
      ).toBeInTheDocument();
    });
  });

  describe('interaction', () => {
    it('toggles password visibility on button click', () => {
      render(<PasswordInput placeholder="Password" />);
      const input = screen.getByPlaceholderText('Password');
      const toggleButton = screen.getByRole('button', {
        name: 'Show password',
      });

      expect(input).toHaveAttribute('type', 'password');
      act(() => {
        toggleButton.click();
      });
      expect(input).toHaveAttribute('type', 'text');
    });
  });

  describe('additional props', () => {
    it('spreads additional props to the element', () => {
      render(<PasswordInput data-testid="pw-input" />);
      expect(screen.getByTestId('pw-input')).toBeInTheDocument();
    });
  });
});
