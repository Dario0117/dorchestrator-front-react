import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { SmallText } from './small-text';

describe('SmallText', () => {
  describe('rendering', () => {
    it('renders children', () => {
      render(<SmallText>Hello world</SmallText>);
      expect(screen.getByText('Hello world')).toBeInTheDocument();
    });

    it('renders as a span element', () => {
      render(<SmallText>text</SmallText>);
      expect(screen.getByText('text').tagName).toBe('SPAN');
    });
  });

  describe('ref forwarding', () => {
    it('forwards ref to the span element', () => {
      const ref = createRef<HTMLSpanElement>();
      render(<SmallText ref={ref}>text</SmallText>);
      expect(ref.current).toBeInstanceOf(HTMLSpanElement);
    });
  });

  describe('additional props', () => {
    it('spreads additional props to the element', () => {
      render(<SmallText data-testid="small">text</SmallText>);
      expect(screen.getByTestId('small')).toBeInTheDocument();
    });
  });
});
