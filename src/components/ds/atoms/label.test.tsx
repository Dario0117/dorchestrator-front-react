import { render, screen } from '@testing-library/react';
import { Label } from './label';

describe('Label', () => {
  describe('rendering', () => {
    it('renders children', () => {
      render(<Label>Username</Label>);
      expect(screen.getByText('Username')).toBeInTheDocument();
    });

    it('renders as a label element', () => {
      render(<Label>Username</Label>);
      expect(screen.getByText('Username').tagName).toBe('LABEL');
    });
  });

  describe('semantic props', () => {
    it('accepts htmlFor prop', () => {
      render(<Label htmlFor="email-field">Email</Label>);
      expect(screen.getByText('Email')).toHaveAttribute('for', 'email-field');
    });
  });

  describe('additional props', () => {
    it('spreads additional props to the element', () => {
      render(<Label data-testid="label">text</Label>);
      expect(screen.getByTestId('label')).toBeInTheDocument();
    });
  });
});
