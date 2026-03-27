import { render, screen } from '@testing-library/react';
import { Logo } from './logo';

describe('Logo', () => {
  it('renders an SVG with accessible label', () => {
    render(<Logo />);
    expect(screen.getByLabelText('Dorchestrator logo')).toBeInTheDocument();
  });

  it('renders with a title element', () => {
    render(<Logo />);
    expect(screen.getByTitle('Dorchestrator')).toBeInTheDocument();
  });

  it('renders the D letter', () => {
    render(<Logo />);
    expect(screen.getByText('D')).toBeInTheDocument();
  });
});
