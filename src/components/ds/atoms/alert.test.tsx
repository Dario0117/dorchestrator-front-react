import { render, screen } from '@testing-library/react';
import { Alert, AlertAction, AlertDescription, AlertTitle } from './alert';

describe('Alert', () => {
  describe('rendering', () => {
    it('renders children', () => {
      render(<Alert>Something happened</Alert>);
      expect(screen.getByText('Something happened')).toBeInTheDocument();
    });

    it('renders with role alert', () => {
      render(<Alert>Notice</Alert>);
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });

  describe('semantic props', () => {
    it('accepts default variant', () => {
      render(<Alert variant="default">Default alert</Alert>);
      expect(screen.getByText('Default alert')).toBeInTheDocument();
    });

    it('accepts destructive variant', () => {
      render(<Alert variant="destructive">Error alert</Alert>);
      expect(screen.getByText('Error alert')).toBeInTheDocument();
    });
  });

  describe('additional props', () => {
    it('spreads additional props to the element', () => {
      render(<Alert data-testid="my-alert">text</Alert>);
      expect(screen.getByTestId('my-alert')).toBeInTheDocument();
    });
  });
});

describe('AlertTitle', () => {
  it('renders children', () => {
    render(<AlertTitle>Title text</AlertTitle>);
    expect(screen.getByText('Title text')).toBeInTheDocument();
  });

  it('spreads additional props to the element', () => {
    render(<AlertTitle data-testid="title">text</AlertTitle>);
    expect(screen.getByTestId('title')).toBeInTheDocument();
  });
});

describe('AlertDescription', () => {
  it('renders children', () => {
    render(<AlertDescription>Description text</AlertDescription>);
    expect(screen.getByText('Description text')).toBeInTheDocument();
  });

  it('spreads additional props to the element', () => {
    render(<AlertDescription data-testid="desc">text</AlertDescription>);
    expect(screen.getByTestId('desc')).toBeInTheDocument();
  });
});

describe('AlertAction', () => {
  it('renders children', () => {
    render(<AlertAction>Action content</AlertAction>);
    expect(screen.getByText('Action content')).toBeInTheDocument();
  });

  it('spreads additional props to the element', () => {
    render(<AlertAction data-testid="action">text</AlertAction>);
    expect(screen.getByTestId('action')).toBeInTheDocument();
  });
});
