import { Alert, AlertDescription, AlertTitle } from '@components/ui/alert';
import { render, screen } from '@testing-library/react';

describe('Alert', () => {
  it('should render with correct role', () => {
    render(<Alert>Alert content</Alert>);
    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveAttribute('data-slot', 'alert');
    expect(alert).toHaveTextContent('Alert content');
  });

  it('should render title with correct content', () => {
    render(
      <Alert>
        <AlertTitle>Alert title</AlertTitle>
      </Alert>,
    );
    const title = screen.getByText('Alert title');
    expect(title).toBeInTheDocument();
    expect(title).toHaveAttribute('data-slot', 'alert-title');
  });

  it('should render description with correct content', () => {
    render(
      <Alert>
        <AlertTitle>Alert title</AlertTitle>
        <AlertDescription>Alert description</AlertDescription>
      </Alert>,
    );
    const title = screen.getByText('Alert title');
    const description = screen.getByText('Alert description');
    expect(title).toBeInTheDocument();
    expect(description).toBeInTheDocument();
    expect(description).toHaveAttribute('data-slot', 'alert-description');
  });

  it('should render with default variant', () => {
    render(
      <Alert>
        <AlertTitle>Default alert</AlertTitle>
        <AlertDescription>This is a default alert</AlertDescription>
      </Alert>,
    );
    expect(screen.getByText('Default alert')).toBeInTheDocument();
    expect(screen.getByText('This is a default alert')).toBeInTheDocument();
  });

  it('should render with destructive variant', () => {
    render(
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Something went wrong</AlertDescription>
      </Alert>,
    );
    expect(screen.getByText('Error')).toBeInTheDocument();
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    render(
      <Alert className="custom-alert">
        <AlertTitle>Custom alert</AlertTitle>
      </Alert>,
    );
    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('custom-alert');
  });

  it('should forward additional props', () => {
    render(
      <Alert
        data-testid="test-alert"
        id="alert-id"
      >
        <AlertTitle>Test alert</AlertTitle>
      </Alert>,
    );
    const alert = screen.getByTestId('test-alert');
    expect(alert).toHaveAttribute('id', 'alert-id');
  });

  it('should render complete alert with icon slot', () => {
    render(
      <Alert>
        <svg
          data-testid="alert-icon"
          role="img"
          aria-label="Alert icon"
        >
          <title>Alert icon</title>
          <path />
        </svg>
        <AlertTitle>Alert with icon</AlertTitle>
        <AlertDescription>This alert has an icon</AlertDescription>
      </Alert>,
    );
    expect(screen.getByTestId('alert-icon')).toBeInTheDocument();
    expect(screen.getByText('Alert with icon')).toBeInTheDocument();
    expect(screen.getByText('This alert has an icon')).toBeInTheDocument();
  });
});
