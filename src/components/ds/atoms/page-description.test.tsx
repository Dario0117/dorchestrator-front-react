import { render, screen } from '@testing-library/react';
import { PageDescription } from './page-description';

describe('PageDescription', () => {
  it('renders children', () => {
    render(<PageDescription>Some description text</PageDescription>);
    expect(screen.getByText('Some description text')).toBeInTheDocument();
  });

  it('renders as a p element', () => {
    render(<PageDescription data-testid="pd">Description</PageDescription>);
    expect(screen.getByTestId('pd').tagName).toBe('P');
  });

  it('spreads additional props', () => {
    render(
      <PageDescription
        data-testid="pd"
        aria-label="Page subtitle"
      >
        Description
      </PageDescription>,
    );
    expect(screen.getByTestId('pd')).toHaveAttribute(
      'aria-label',
      'Page subtitle',
    );
  });
});
