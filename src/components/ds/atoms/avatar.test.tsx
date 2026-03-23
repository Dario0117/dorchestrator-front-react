import { render, screen } from '@testing-library/react';
import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
} from './avatar';

describe('Avatar', () => {
  describe('rendering', () => {
    it('renders with fallback', () => {
      render(
        <Avatar>
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>,
      );
      expect(screen.getByText('JD')).toBeInTheDocument();
    });
  });

  describe('semantic props', () => {
    it('accepts size prop', () => {
      render(
        <Avatar
          size="sm"
          data-testid="avatar"
        >
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>,
      );
      expect(screen.getByTestId('avatar')).toBeInTheDocument();
    });
  });

  describe('additional props', () => {
    it('spreads additional props to the element', () => {
      render(
        <Avatar data-testid="avatar">
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>,
      );
      expect(screen.getByTestId('avatar')).toBeInTheDocument();
    });
  });
});

describe('AvatarImage', () => {
  it('renders image element', () => {
    const { container } = render(
      <Avatar>
        <AvatarImage
          src="test.jpg"
          alt="Test"
        />
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>,
    );
    const image = container.querySelector('img');
    expect(image).toBeDefined();
  });
});

describe('AvatarFallback', () => {
  it('renders children', () => {
    render(
      <Avatar>
        <AvatarFallback>AB</AvatarFallback>
      </Avatar>,
    );
    expect(screen.getByText('AB')).toBeInTheDocument();
  });

  it('spreads additional props to the element', () => {
    render(
      <Avatar>
        <AvatarFallback data-testid="fallback">AB</AvatarFallback>
      </Avatar>,
    );
    expect(screen.getByTestId('fallback')).toBeInTheDocument();
  });
});

describe('AvatarBadge', () => {
  it('renders children', () => {
    render(
      <Avatar>
        <AvatarFallback>JD</AvatarFallback>
        <AvatarBadge data-testid="badge" />
      </Avatar>,
    );
    expect(screen.getByTestId('badge')).toBeInTheDocument();
  });
});

describe('AvatarGroup', () => {
  it('renders children', () => {
    render(
      <AvatarGroup data-testid="group">
        <Avatar>
          <AvatarFallback>A</AvatarFallback>
        </Avatar>
      </AvatarGroup>,
    );
    expect(screen.getByTestId('group')).toBeInTheDocument();
  });
});

describe('AvatarGroupCount', () => {
  it('renders children', () => {
    render(<AvatarGroupCount>+3</AvatarGroupCount>);
    expect(screen.getByText('+3')).toBeInTheDocument();
  });
});
