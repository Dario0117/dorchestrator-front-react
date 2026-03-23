import { QueuedSessionsPage } from '@domains/org/pages/queued-sessions.page';
import { render, screen } from '@testing-library/react';

describe('QueuedSessionsPage', () => {
  it('should render the page content', () => {
    render(<QueuedSessionsPage />);

    expect(screen.getByText('Hello Queued Sessions!')).toBeInTheDocument();
  });

  it('should render a div element', () => {
    const { container } = render(<QueuedSessionsPage />);

    const div = container.querySelector('div');
    expect(div).toBeInTheDocument();
    expect(div).toHaveTextContent('Hello Queued Sessions!');
  });

  it('should maintain consistent rendering on multiple renders', () => {
    const { rerender } = render(<QueuedSessionsPage />);

    expect(screen.getByText('Hello Queued Sessions!')).toBeInTheDocument();

    rerender(<QueuedSessionsPage />);

    expect(screen.getByText('Hello Queued Sessions!')).toBeInTheDocument();
  });
});
