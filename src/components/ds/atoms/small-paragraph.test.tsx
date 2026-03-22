import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { SmallParagraph } from './small-paragraph';

describe('SmallParagraph', () => {
  describe('rendering', () => {
    it('renders children', () => {
      render(<SmallParagraph>Hello world</SmallParagraph>);
      expect(screen.getByText('Hello world')).toBeInTheDocument();
    });

    it('renders as a p element', () => {
      render(<SmallParagraph>text</SmallParagraph>);
      expect(screen.getByText('text').tagName).toBe('P');
    });
  });

  describe('ref forwarding', () => {
    it('forwards ref to the p element', () => {
      const ref = createRef<HTMLParagraphElement>();
      render(<SmallParagraph ref={ref}>text</SmallParagraph>);
      expect(ref.current).toBeInstanceOf(HTMLParagraphElement);
    });
  });

  describe('additional props', () => {
    it('spreads additional props to the element', () => {
      render(<SmallParagraph data-testid="small-p">text</SmallParagraph>);
      expect(screen.getByTestId('small-p')).toBeInTheDocument();
    });
  });
});
