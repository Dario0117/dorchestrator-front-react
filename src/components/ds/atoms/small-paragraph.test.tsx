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

  describe('semantic props', () => {
    it('accepts truncate', () => {
      render(<SmallParagraph truncate>truncated text</SmallParagraph>);
      expect(screen.getByText('truncated text')).toBeInTheDocument();
    });

    it('accepts mono', () => {
      render(<SmallParagraph mono>monospace</SmallParagraph>);
      expect(screen.getByText('monospace')).toBeInTheDocument();
    });

    it('accepts spaceBelow', () => {
      render(<SmallParagraph spaceBelow="md">text</SmallParagraph>);
      expect(screen.getByText('text')).toBeInTheDocument();
    });

    it('accepts textAlign="right"', () => {
      render(<SmallParagraph textAlign="right">right-aligned</SmallParagraph>);
      expect(screen.getByText('right-aligned')).toBeInTheDocument();
    });
  });

  describe('additional props', () => {
    it('spreads additional props to the element', () => {
      render(<SmallParagraph data-testid="small-p">text</SmallParagraph>);
      expect(screen.getByTestId('small-p')).toBeInTheDocument();
    });
  });
});
