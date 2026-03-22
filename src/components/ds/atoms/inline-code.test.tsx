import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { InlineCode } from './inline-code';

describe('InlineCode', () => {
  describe('rendering', () => {
    it('renders children', () => {
      render(<InlineCode>abc-123</InlineCode>);
      expect(screen.getByText('abc-123')).toBeInTheDocument();
    });

    it('renders as a code element', () => {
      render(<InlineCode>text</InlineCode>);
      expect(screen.getByText('text').tagName).toBe('CODE');
    });
  });

  describe('ref forwarding', () => {
    it('forwards ref to the code element', () => {
      const ref = createRef<HTMLElement>();
      render(<InlineCode ref={ref}>text</InlineCode>);
      expect(ref.current).toBeInstanceOf(HTMLElement);
      expect(ref.current?.tagName).toBe('CODE');
    });
  });

  describe('additional props', () => {
    it('spreads additional props to the element', () => {
      render(<InlineCode data-testid="code">text</InlineCode>);
      expect(screen.getByTestId('code')).toBeInTheDocument();
    });
  });
});
