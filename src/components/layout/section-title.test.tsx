import { render, screen } from '@testing-library/react';
import { SectionTitle } from './section-title';

describe('SectionTitle', () => {
  it('renders children', () => {
    render(<SectionTitle>Commands</SectionTitle>);
    expect(screen.getByText('Commands')).toBeInTheDocument();
  });

  it('renders as an h1 element', () => {
    render(<SectionTitle>Commands</SectionTitle>);
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });

  it('spreads additional props', () => {
    render(<SectionTitle data-testid="st">Title</SectionTitle>);
    expect(screen.getByTestId('st')).toBeInTheDocument();
  });
});
