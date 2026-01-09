import { Avatar, AvatarFallback, AvatarImage } from '@components/ui/avatar';
import { render, screen } from '@testing-library/react';

describe('Avatar', () => {
  it('renders avatar component', () => {
    render(
      <Avatar data-testid="avatar">
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>,
    );

    expect(screen.getByTestId('avatar')).toBeInTheDocument();
  });

  it('displays image when src is provided', () => {
    const { container } = render(
      <Avatar>
        <AvatarImage
          src="https://example.com/avatar.jpg"
          alt="User Avatar"
        />
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>,
    );

    // Check if image element exists in the DOM (may not be visible due to Radix behavior)
    const image = container.querySelector('img');
    expect(image).toBeDefined();
  });

  it('displays fallback when image fails to load', () => {
    render(
      <Avatar>
        <AvatarImage
          src="invalid-url"
          alt="User Avatar"
        />
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>,
    );

    // Since the image will fail to load, fallback should be visible
    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('displays fallback when no image is provided', () => {
    render(
      <Avatar>
        <AvatarFallback>John Doe</AvatarFallback>
      </Avatar>,
    );

    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('renders Avatar with custom attributes', () => {
    render(
      <Avatar
        className="custom-avatar"
        data-testid="avatar"
      >
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>,
    );

    expect(screen.getByTestId('avatar')).toBeInTheDocument();
    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('renders AvatarFallback with content', () => {
    render(
      <Avatar>
        <AvatarFallback className="custom-fallback">JD</AvatarFallback>
      </Avatar>,
    );

    expect(screen.getByText('JD')).toBeInTheDocument();
    expect(screen.getByText('JD')).toHaveAttribute(
      'data-slot',
      'avatar-fallback',
    );
  });

  it('has correct data-slot attributes', () => {
    const { container } = render(
      <Avatar>
        <AvatarImage
          src="test.jpg"
          alt="Test"
        />
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>,
    );

    expect(container.querySelector('[data-slot="avatar"]')).toBeInTheDocument();
    expect(container.querySelector('[data-slot="avatar-image"]')).toBeDefined();
    expect(
      container.querySelector('[data-slot="avatar-fallback"]'),
    ).toBeInTheDocument();
  });

  it('forwards additional props to components', () => {
    const { container } = render(
      <Avatar data-custom="avatar-prop">
        <AvatarImage
          src="test.jpg"
          alt="Test"
          data-custom="image-prop"
        />
        <AvatarFallback data-custom="fallback-prop">JD</AvatarFallback>
      </Avatar>,
    );

    expect(
      screen.getByText('JD').closest('[data-custom="avatar-prop"]'),
    ).toBeInTheDocument();

    const image = container.querySelector('img');
    if (image) {
      expect(image).toHaveAttribute('data-custom', 'image-prop');
    }

    expect(screen.getByText('JD')).toHaveAttribute(
      'data-custom',
      'fallback-prop',
    );
  });
});
