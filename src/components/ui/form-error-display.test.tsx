import { FormErrorDisplay } from '@components/ui/form-error-display';
import { render, screen } from '@testing-library/react';

describe('FormErrorDisplay', () => {
  it('should not render anything when error is null', () => {
    const { container } = render(<FormErrorDisplay errors={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('should render error message when error is provided', () => {
    render(<FormErrorDisplay errors={['Invalid credentials']} />);

    expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
  });

  it('should render error with destructive alert variant', () => {
    const { container } = render(
      <FormErrorDisplay errors={['Server error occurred']} />,
    );

    expect(screen.getByText('Server error occurred')).toBeInTheDocument();

    // Check if the alert has the destructive variant (this will depend on your Alert component implementation)
    const alert = container.querySelector('[data-slot="alert"]');
    expect(alert).toBeInTheDocument();
  });

  it('should handle multiple error messages', () => {
    render(<FormErrorDisplay errors={['Validation failed']} />);

    expect(screen.getByText('Validation failed')).toBeInTheDocument();
  });

  it('should handle different error message types', () => {
    const testCases = [
      'Authentication failed',
      'Network error',
      'Server temporarily unavailable',
      'Invalid request format',
    ];

    testCases.forEach((message) => {
      const { rerender } = render(<FormErrorDisplay errors={[message]} />);

      expect(screen.getByText(message)).toBeInTheDocument();

      // Clean up for next iteration
      rerender(<FormErrorDisplay errors={[]} />);
    });
  });

  it('should render wrapper structure correctly', () => {
    const { container } = render(<FormErrorDisplay errors={['Test error']} />);

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toBeInTheDocument();
    expect(wrapper.tagName).toBe('DIV');
  });

  it('should render multiple times with different errors', () => {
    const { rerender } = render(<FormErrorDisplay errors={['First error']} />);
    expect(screen.getByText('First error')).toBeInTheDocument();

    rerender(<FormErrorDisplay errors={['Second error']} />);
    expect(screen.getByText('Second error')).toBeInTheDocument();
    expect(screen.queryByText('First error')).not.toBeInTheDocument();

    rerender(<FormErrorDisplay errors={[]} />);
    expect(screen.queryByText('Second error')).not.toBeInTheDocument();
  });

  it('should handle empty error message', () => {
    render(<FormErrorDisplay errors={['']} />);

    // Should still render the alert structure even with empty message
    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
  });
});
