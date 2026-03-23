import { render, screen } from '@testing-library/react';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from './card';

describe('Card', () => {
  describe('rendering', () => {
    it('renders children', () => {
      render(<Card>Card content</Card>);
      expect(screen.getByText('Card content')).toBeInTheDocument();
    });

    it('renders as a div element', () => {
      render(<Card data-testid="card">content</Card>);
      expect(screen.getByTestId('card').tagName).toBe('DIV');
    });
  });

  describe('semantic props', () => {
    it('accepts size prop', () => {
      render(<Card size="sm">Small card</Card>);
      expect(screen.getByText('Small card')).toBeInTheDocument();
    });

    it('renders static card by default', () => {
      render(<Card data-testid="card">content</Card>);
      expect(screen.getByTestId('card')).toBeInTheDocument();
    });

    it('accepts interactive prop', () => {
      render(
        <Card
          interactive
          data-testid="card"
        >
          Clickable card
        </Card>,
      );
      expect(screen.getByTestId('card')).toBeInTheDocument();
      expect(screen.getByText('Clickable card')).toBeInTheDocument();
    });

    it('accepts variant prop', () => {
      render(
        <Card
          variant="destructive"
          data-testid="card"
        >
          Danger zone
        </Card>,
      );
      expect(screen.getByTestId('card')).toBeInTheDocument();
      expect(screen.getByText('Danger zone')).toBeInTheDocument();
    });

    it('accepts both interactive and variant props together', () => {
      render(
        <Card
          interactive
          variant="destructive"
          data-testid="card"
        >
          content
        </Card>,
      );
      expect(screen.getByTestId('card')).toBeInTheDocument();
    });
  });

  describe('additional props', () => {
    it('spreads additional props to the element', () => {
      render(<Card data-testid="custom-card">text</Card>);
      expect(screen.getByTestId('custom-card')).toBeInTheDocument();
    });
  });
});

describe('CardHeader', () => {
  describe('rendering', () => {
    it('renders children', () => {
      render(<CardHeader>Header content</CardHeader>);
      expect(screen.getByText('Header content')).toBeInTheDocument();
    });
  });

  describe('additional props', () => {
    it('spreads additional props to the element', () => {
      render(<CardHeader data-testid="header">text</CardHeader>);
      expect(screen.getByTestId('header')).toBeInTheDocument();
    });
  });
});

describe('CardTitle', () => {
  describe('rendering', () => {
    it('renders children', () => {
      render(<CardTitle>Title text</CardTitle>);
      expect(screen.getByText('Title text')).toBeInTheDocument();
    });
  });

  describe('semantic props', () => {
    it('accepts color="destructive"', () => {
      render(<CardTitle color="destructive">Danger</CardTitle>);
      expect(screen.getByText('Danger')).toBeInTheDocument();
    });

    it('accepts icon prop', () => {
      render(<CardTitle icon>Icon title</CardTitle>);
      expect(screen.getByText('Icon title')).toBeInTheDocument();
    });
  });

  describe('additional props', () => {
    it('spreads additional props to the element', () => {
      render(<CardTitle data-testid="title">text</CardTitle>);
      expect(screen.getByTestId('title')).toBeInTheDocument();
    });
  });
});

describe('CardDescription', () => {
  describe('rendering', () => {
    it('renders children', () => {
      render(<CardDescription>Description text</CardDescription>);
      expect(screen.getByText('Description text')).toBeInTheDocument();
    });
  });

  describe('additional props', () => {
    it('spreads additional props to the element', () => {
      render(<CardDescription data-testid="description">text</CardDescription>);
      expect(screen.getByTestId('description')).toBeInTheDocument();
    });
  });
});

describe('CardAction', () => {
  describe('rendering', () => {
    it('renders children', () => {
      render(<CardAction>Action content</CardAction>);
      expect(screen.getByText('Action content')).toBeInTheDocument();
    });
  });

  describe('additional props', () => {
    it('spreads additional props to the element', () => {
      render(<CardAction data-testid="action">text</CardAction>);
      expect(screen.getByTestId('action')).toBeInTheDocument();
    });
  });
});

describe('CardContent', () => {
  describe('rendering', () => {
    it('renders children', () => {
      render(<CardContent>Main content</CardContent>);
      expect(screen.getByText('Main content')).toBeInTheDocument();
    });
  });

  describe('additional props', () => {
    it('spreads additional props to the element', () => {
      render(<CardContent data-testid="content">text</CardContent>);
      expect(screen.getByTestId('content')).toBeInTheDocument();
    });
  });
});

describe('CardFooter', () => {
  describe('rendering', () => {
    it('renders children', () => {
      render(<CardFooter>Footer content</CardFooter>);
      expect(screen.getByText('Footer content')).toBeInTheDocument();
    });
  });

  describe('additional props', () => {
    it('spreads additional props to the element', () => {
      render(<CardFooter data-testid="footer">text</CardFooter>);
      expect(screen.getByTestId('footer')).toBeInTheDocument();
    });
  });
});

describe('Card composition', () => {
  it('renders a fully composed card', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>My Title</CardTitle>
          <CardDescription>My Description</CardDescription>
          <CardAction>Action</CardAction>
        </CardHeader>
        <CardContent>Body</CardContent>
        <CardFooter>Footer</CardFooter>
      </Card>,
    );
    expect(screen.getByText('My Title')).toBeInTheDocument();
    expect(screen.getByText('My Description')).toBeInTheDocument();
    expect(screen.getByText('Action')).toBeInTheDocument();
    expect(screen.getByText('Body')).toBeInTheDocument();
    expect(screen.getByText('Footer')).toBeInTheDocument();
  });
});
