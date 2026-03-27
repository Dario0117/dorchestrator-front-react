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

  describe('centered', () => {
    it('applies centering classes when centered is true', () => {
      render(
        <PageSection
          data-testid="ps"
          centered
        >
          Content
        </PageSection>,
      );
      const el = screen.getByTestId('ps');
      expect(el).toHaveClass('flex', 'items-center', 'justify-center');
    });

    it('does not apply centering classes by default', () => {
      render(<PageSection data-testid="ps">Content</PageSection>);
      const el = screen.getByTestId('ps');
      expect(el).not.toHaveClass('flex');
    });
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
