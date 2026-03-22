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

  describe('semantic props', () => {
    it('accepts centered prop', () => {
      render(<SmallText centered>centered text</SmallText>);
      expect(screen.getByText('centered text')).toBeInTheDocument();
    });

    it('accepts mono prop', () => {
      render(<SmallText mono>mono text</SmallText>);
      expect(screen.getByText('mono text')).toBeInTheDocument();
    });

    it('accepts noWrap prop', () => {
      render(<SmallText noWrap>no wrap text</SmallText>);
      expect(screen.getByText('no wrap text')).toBeInTheDocument();
    });

    it('accepts multiple semantic props', () => {
      render(
        <SmallText
          centered
          mono
          noWrap
        >
          all props
        </SmallText>,
      );
      expect(screen.getByText('all props')).toBeInTheDocument();
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
