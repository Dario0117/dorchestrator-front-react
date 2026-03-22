import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { SecondaryParagraph } from './secondary-paragraph';

describe('SecondaryParagraph', () => {
  describe('rendering', () => {
    it('renders children', () => {
      render(<SecondaryParagraph>Hello world</SecondaryParagraph>);
      expect(screen.getByText('Hello world')).toBeInTheDocument();
    });

    it('renders as a p element', () => {
      render(<SecondaryParagraph>text</SecondaryParagraph>);
      expect(screen.getByText('text').tagName).toBe('P');
    });
  });

  describe('ref forwarding', () => {
    it('forwards ref to the p element', () => {
      const ref = createRef<HTMLParagraphElement>();
      render(<SecondaryParagraph ref={ref}>text</SecondaryParagraph>);
      expect(ref.current).toBeInstanceOf(HTMLParagraphElement);
    });
  });

  describe('additional props', () => {
    it('spreads additional props to the element', () => {
      render(<SecondaryParagraph data-testid="sec-p">text</SecondaryParagraph>);
      expect(screen.getByTestId('sec-p')).toBeInTheDocument();
    });
  });
});
