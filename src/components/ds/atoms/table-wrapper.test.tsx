import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { TableWrapper } from './table-wrapper';

describe('TableWrapper', () => {
  describe('rendering', () => {
    it('renders children', () => {
      render(<TableWrapper>content</TableWrapper>);
      expect(screen.getByText('content')).toBeInTheDocument();
    });

    it('renders as a div element', () => {
      render(<TableWrapper data-testid="wrapper">content</TableWrapper>);
      expect(screen.getByTestId('wrapper').tagName).toBe('DIV');
    });
  });

  describe('ref forwarding', () => {
    it('forwards ref to the div element', () => {
      const ref = createRef<HTMLDivElement>();
      render(<TableWrapper ref={ref}>content</TableWrapper>);
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });
  });

  describe('additional props', () => {
    it('spreads additional props to the element', () => {
      render(<TableWrapper data-testid="table-wrap">content</TableWrapper>);
      expect(screen.getByTestId('table-wrap')).toBeInTheDocument();
    });
  });
});
