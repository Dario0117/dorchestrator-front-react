import { render, screen } from '@testing-library/react';
import { FormErrorDisplay } from './form-error-display';

describe('FormErrorDisplay', () => {
  it('renders nothing when errors is null', () => {
    const { container } = render(<FormErrorDisplay errors={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders nothing when errors is empty', () => {
    const { container } = render(<FormErrorDisplay errors={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders error messages', () => {
    render(<FormErrorDisplay errors={['Something went wrong']} />);
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });
});
