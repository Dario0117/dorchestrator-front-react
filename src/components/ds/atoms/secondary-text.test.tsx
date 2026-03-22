import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { SecondaryText } from './secondary-text';

describe('SecondaryText', () => {
  describe('rendering', () => {
    it('renders children', () => {
      render(<SecondaryText>Hello world</SecondaryText>);
      expect(screen.getByText('Hello world')).toBeInTheDocument();
    });

    it('renders as a span element', () => {
      render(<SecondaryText>text</SecondaryText>);
      expect(screen.getByText('text').tagName).toBe('SPAN');
    });
  });

  describe('semantic props', () => {
    it('accepts centered prop', () => {
      render(<SecondaryText centered>centered text</SecondaryText>);
      expect(screen.getByText('centered text')).toBeInTheDocument();
    });
  });

  describe('ref forwarding', () => {
    it('forwards ref to the span element', () => {
      const ref = createRef<HTMLSpanElement>();
      render(<SecondaryText ref={ref}>text</SecondaryText>);
      expect(ref.current).toBeInstanceOf(HTMLSpanElement);
    });
  });

  describe('additional props', () => {
    it('spreads additional props to the element', () => {
      render(<SecondaryText data-testid="secondary">text</SecondaryText>);
      expect(screen.getByTestId('secondary')).toBeInTheDocument();
    });
  });
});
