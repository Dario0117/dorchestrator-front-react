import { render, screen } from '@testing-library/react';
import { FormErrorDisplay } from './form-error-display';

describe('FormErrorDisplay', () => {
  it('renders nothing when errors is null', () => {
    const { container } = render(<FormErrorDisplay errors={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders nothing when errors is undefined', () => {
    const { container } = render(<FormErrorDisplay errors={undefined} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders nothing when errors is empty', () => {
    const { container } = render(<FormErrorDisplay errors={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders a single error message', () => {
    render(<FormErrorDisplay errors={['Something went wrong']} />);
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('renders multiple error messages', () => {
    render(<FormErrorDisplay errors={['First error', 'Second error']} />);
    expect(screen.getByText('First error')).toBeInTheDocument();
    expect(screen.getByText('Second error')).toBeInTheDocument();
  });

  it('renders inside a destructive alert', () => {
    render(<FormErrorDisplay errors={['Error']} />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });
});
