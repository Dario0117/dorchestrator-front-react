import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { SecondaryText } from './secondary-text';

describe('SecondaryText', () => {
  it('renders children', () => {
    render(<SecondaryText>Hello world</SecondaryText>);
    expect(screen.getByText('Hello world')).toBeInTheDocument();
  });

  it('renders as a span element', () => {
    render(<SecondaryText>text</SecondaryText>);
    expect(screen.getByText('text').tagName).toBe('SPAN');
  });

  describe('centered', () => {
    it('applies text-center when centered is true', () => {
      render(<SecondaryText centered>centered text</SecondaryText>);
      expect(screen.getByText('centered text')).toHaveClass('text-center');
    });

    it('does not apply text-center by default', () => {
      render(<SecondaryText>normal text</SecondaryText>);
      expect(screen.getByText('normal text')).not.toHaveClass('text-center');
    });
  });

  it('forwards ref to the span element', () => {
    const ref = createRef<HTMLSpanElement>();
    render(<SecondaryText ref={ref}>text</SecondaryText>);
    expect(ref.current).toBeInstanceOf(HTMLSpanElement);
  });

  it('spreads additional props', () => {
    render(<SecondaryText data-testid="secondary">text</SecondaryText>);
    expect(screen.getByTestId('secondary')).toBeInTheDocument();
  });
});
