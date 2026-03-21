import { render, screen } from '@testing-library/react';
import { PageSection } from './page-section';

describe('PageSection', () => {
  it('renders children', () => {
    render(<PageSection>Content here</PageSection>);
    expect(screen.getByText('Content here')).toBeInTheDocument();
  });

  it('renders as a section element', () => {
    render(<PageSection data-testid="ps">Content</PageSection>);
    expect(screen.getByTestId('ps').tagName).toBe('SECTION');
  });

  it('spreads additional props', () => {
    render(
      <PageSection
        data-testid="ps"
        aria-label="Main content"
      >
        Content
      </PageSection>,
    );
    expect(screen.getByTestId('ps')).toHaveAttribute(
      'aria-label',
      'Main content',
    );
  });
});
