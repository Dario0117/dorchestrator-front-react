import { ProjectsPage } from '@components/org/pages/projects.page';
import { render, screen } from '@testing-library/react';

describe('ProjectsPage', () => {
  it('should render the page content', () => {
    render(<ProjectsPage />);

    expect(screen.getByText('Hello projects!')).toBeInTheDocument();
  });

  it('should render a div element', () => {
    const { container } = render(<ProjectsPage />);

    const div = container.querySelector('div');
    expect(div).toBeInTheDocument();
    expect(div).toHaveTextContent('Hello projects!');
  });

  it('should maintain consistent rendering on multiple renders', () => {
    const { rerender } = render(<ProjectsPage />);

    expect(screen.getByText('Hello projects!')).toBeInTheDocument();

    rerender(<ProjectsPage />);

    expect(screen.getByText('Hello projects!')).toBeInTheDocument();
  });
});
