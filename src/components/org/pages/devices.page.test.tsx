import { DevicesPage } from '@components/org/pages/devices.page';
import { render, screen } from '@testing-library/react';

describe('DevicesPage', () => {
  it('should render the page content', () => {
    render(<DevicesPage />);

    expect(screen.getByText('Hello Devices!')).toBeInTheDocument();
  });

  it('should render a div element', () => {
    const { container } = render(<DevicesPage />);

    const div = container.querySelector('div');
    expect(div).toBeInTheDocument();
    expect(div).toHaveTextContent('Hello Devices!');
  });

  it('should maintain consistent rendering on multiple renders', () => {
    const { rerender } = render(<DevicesPage />);

    expect(screen.getByText('Hello Devices!')).toBeInTheDocument();

    rerender(<DevicesPage />);

    expect(screen.getByText('Hello Devices!')).toBeInTheDocument();
  });
});
