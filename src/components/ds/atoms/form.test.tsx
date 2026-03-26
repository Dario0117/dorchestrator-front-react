import { Form } from '@components/ds/atoms/form';
import { renderWithProviders } from '@lib/test-wrappers.utils';
import { screen } from '@testing-library/react';

describe('Form', () => {
  describe('rendering', () => {
    it('renders as a form element', () => {
      renderWithProviders(
        <Form data-testid="form">
          <input />
        </Form>,
      );
      expect(screen.getByTestId('form').tagName).toBe('FORM');
    });

    it('renders children', () => {
      renderWithProviders(
        <Form>
          <span>Name</span>
        </Form>,
      );
      expect(screen.getByText('Name')).toBeInTheDocument();
    });
  });

  describe('semantic props', () => {
    it('accepts gap prop', () => {
      renderWithProviders(
        <Form
          gap="lg"
          data-testid="form"
        >
          <input />
        </Form>,
      );
      expect(screen.getByTestId('form')).toBeInTheDocument();
    });

    it('accepts innerSpaceY prop', () => {
      renderWithProviders(
        <Form
          innerSpaceY="md"
          data-testid="form"
        >
          <input />
        </Form>,
      );
      expect(screen.getByTestId('form')).toBeInTheDocument();
    });
  });

  describe('additional props', () => {
    it('spreads additional props to the form element', () => {
      renderWithProviders(
        <Form
          data-testid="form"
          aria-label="test form"
        >
          <input />
        </Form>,
      );
      expect(screen.getByTestId('form')).toHaveAttribute(
        'aria-label',
        'test form',
      );
    });
  });
});
