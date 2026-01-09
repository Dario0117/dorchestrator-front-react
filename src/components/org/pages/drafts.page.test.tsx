import { DraftsPage } from '@components/org/pages/drafts.page';
import { render, screen } from '@testing-library/react';

describe('DraftsPage', () => {
  it('should render the page content', () => {
    render(<DraftsPage />);

    expect(screen.getByText('Hello Drafts!')).toBeInTheDocument();
  });

  it('should render a div element', () => {
    const { container } = render(<DraftsPage />);

    const div = container.querySelector('div');
    expect(div).toBeInTheDocument();
    expect(div).toHaveTextContent('Hello Drafts!');
  });

  it('should maintain consistent rendering on multiple renders', () => {
    const { rerender } = render(<DraftsPage />);

    expect(screen.getByText('Hello Drafts!')).toBeInTheDocument();

    rerender(<DraftsPage />);

    expect(screen.getByText('Hello Drafts!')).toBeInTheDocument();
  });
});
