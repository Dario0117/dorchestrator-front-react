import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { CodeText } from './code-text';

describe('CodeText', () => {
  describe('rendering', () => {
    it('renders children', () => {
      render(<CodeText>abc-123</CodeText>);
      expect(screen.getByText('abc-123')).toBeInTheDocument();
    });

    it('renders as a span element', () => {
      render(<CodeText>text</CodeText>);
      expect(screen.getByText('text').tagName).toBe('SPAN');
    });
  });

  describe('ref forwarding', () => {
    it('forwards ref to the span element', () => {
      const ref = createRef<HTMLSpanElement>();
      render(<CodeText ref={ref}>text</CodeText>);
      expect(ref.current).toBeInstanceOf(HTMLSpanElement);
    });
  });

  describe('additional props', () => {
    it('spreads additional props to the element', () => {
      render(<CodeText data-testid="code">text</CodeText>);
      expect(screen.getByTestId('code')).toBeInTheDocument();
    });
  });
});
