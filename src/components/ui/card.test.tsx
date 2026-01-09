import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@components/ui/card';
import { render, screen } from '@testing-library/react';

describe('Card Components', () => {
  describe('Card', () => {
    it('should render successfully', () => {
      render(<Card>Card content</Card>);
      const card = screen.getByText('Card content');
      expect(card).toBeInTheDocument();
      expect(card).toHaveAttribute('data-slot', 'card');
    });

    it('should render with custom className', () => {
      render(<Card className="custom-card">Card</Card>);
      const card = screen.getByText('Card');
      expect(card).toHaveClass('custom-card');
    });

    it('should render as div element', () => {
      render(<Card>Card</Card>);
      const card = screen.getByText('Card');
      expect(card.tagName).toBe('DIV');
    });
  });

  describe('CardHeader', () => {
    it('should render successfully', () => {
      render(<CardHeader>Header content</CardHeader>);
      const header = screen.getByText('Header content');
      expect(header).toBeInTheDocument();
      expect(header).toHaveAttribute('data-slot', 'card-header');
    });

    it('should render as div element', () => {
      render(<CardHeader>Header</CardHeader>);
      const header = screen.getByText('Header');
      expect(header.tagName).toBe('DIV');
    });
  });

  describe('CardTitle', () => {
    it('should render successfully', () => {
      render(<CardTitle>Card Title</CardTitle>);
      const title = screen.getByText('Card Title');
      expect(title).toBeInTheDocument();
      expect(title).toHaveAttribute('data-slot', 'card-title');
    });

    it('should render as div element', () => {
      render(<CardTitle>Title</CardTitle>);
      const title = screen.getByText('Title');
      expect(title.tagName).toBe('DIV');
    });
  });

  describe('CardDescription', () => {
    it('should render successfully', () => {
      render(<CardDescription>Card description</CardDescription>);
      const description = screen.getByText('Card description');
      expect(description).toBeInTheDocument();
      expect(description).toHaveAttribute('data-slot', 'card-description');
    });

    it('should render as div element', () => {
      render(<CardDescription>Description</CardDescription>);
      const description = screen.getByText('Description');
      expect(description.tagName).toBe('DIV');
    });
  });

  describe('CardAction', () => {
    it('should render successfully', () => {
      render(<CardAction>Action content</CardAction>);
      const action = screen.getByText('Action content');
      expect(action).toBeInTheDocument();
      expect(action).toHaveAttribute('data-slot', 'card-action');
    });

    it('should render as div element', () => {
      render(<CardAction>Action</CardAction>);
      const action = screen.getByText('Action');
      expect(action.tagName).toBe('DIV');
    });
  });

  describe('CardContent', () => {
    it('should render successfully', () => {
      render(<CardContent>Card content</CardContent>);
      const content = screen.getByText('Card content');
      expect(content).toBeInTheDocument();
      expect(content).toHaveAttribute('data-slot', 'card-content');
    });

    it('should render as div element', () => {
      render(<CardContent>Content</CardContent>);
      const content = screen.getByText('Content');
      expect(content.tagName).toBe('DIV');
    });
  });

  describe('CardFooter', () => {
    it('should render successfully', () => {
      render(<CardFooter>Footer content</CardFooter>);
      const footer = screen.getByText('Footer content');
      expect(footer).toBeInTheDocument();
      expect(footer).toHaveAttribute('data-slot', 'card-footer');
    });

    it('should render as div element', () => {
      render(<CardFooter>Footer</CardFooter>);
      const footer = screen.getByText('Footer');
      expect(footer.tagName).toBe('DIV');
    });
  });

  describe('Complete Card Structure', () => {
    it('should render a complete card with all components', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Test Title</CardTitle>
            <CardDescription>Test description</CardDescription>
            <CardAction>Action</CardAction>
          </CardHeader>
          <CardContent>
            <p>Main content goes here</p>
          </CardContent>
          <CardFooter>
            <button type="button">Footer button</button>
          </CardFooter>
        </Card>,
      );

      expect(screen.getByText('Test Title')).toBeInTheDocument();
      expect(screen.getByText('Test description')).toBeInTheDocument();
      expect(screen.getByText('Action')).toBeInTheDocument();
      expect(screen.getByText('Main content goes here')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Footer button' }),
      ).toBeInTheDocument();
    });

    it('should forward all props correctly', () => {
      render(
        <Card
          data-testid="test-card"
          id="card-id"
        >
          <CardHeader data-testid="test-header">
            <CardTitle data-testid="test-title">Title</CardTitle>
          </CardHeader>
        </Card>,
      );

      expect(screen.getByTestId('test-card')).toHaveAttribute('id', 'card-id');
      expect(screen.getByTestId('test-header')).toBeInTheDocument();
      expect(screen.getByTestId('test-title')).toBeInTheDocument();
    });
  });
});
