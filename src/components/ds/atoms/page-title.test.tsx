import { render, screen } from '@testing-library/react';
import { PageTitle } from './page-title';

describe('PageTitle', () => {
  it('renders children', () => {
    render(<PageTitle>Dashboard</PageTitle>);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('renders as an h1 element', () => {
    render(<PageTitle>Dashboard</PageTitle>);
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });

  it('spreads additional props', () => {
    render(<PageTitle data-testid="pt">Title</PageTitle>);
    expect(screen.getByTestId('pt')).toBeInTheDocument();
  });
});
