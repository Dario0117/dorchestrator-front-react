import { render, screen } from '@testing-library/react';
import { PageHeadingBar } from './page-heading-bar';

describe('PageHeadingBar', () => {
  it('renders children', () => {
    render(<PageHeadingBar>Heading content</PageHeadingBar>);
    expect(screen.getByText('Heading content')).toBeInTheDocument();
  });

  it('renders as a div element', () => {
    render(<PageHeadingBar data-testid="phb">Content</PageHeadingBar>);
    expect(screen.getByTestId('phb').tagName).toBe('DIV');
  });

  it('spreads additional props', () => {
    render(
      <PageHeadingBar
        data-testid="phb"
        aria-label="Page header"
      >
        Content
      </PageHeadingBar>,
    );
    expect(screen.getByTestId('phb')).toHaveAttribute(
      'aria-label',
      'Page header',
    );
  });
});
