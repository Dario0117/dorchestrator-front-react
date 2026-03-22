import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { DefinitionList } from './definition-list';

describe('DefinitionList', () => {
  describe('rendering', () => {
    it('renders children', () => {
      render(
        <DefinitionList>
          <dt>Name</dt>
          <dd>Value</dd>
        </DefinitionList>,
      );
      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Value')).toBeInTheDocument();
    });

    it('renders as a dl element', () => {
      render(
        <DefinitionList data-testid="dl">
          <dt>Name</dt>
        </DefinitionList>,
      );
      expect(screen.getByTestId('dl').tagName).toBe('DL');
    });
  });

  describe('ref forwarding', () => {
    it('forwards ref to the dl element', () => {
      const ref = createRef<HTMLDListElement>();
      render(
        <DefinitionList ref={ref}>
          <dt>Name</dt>
        </DefinitionList>,
      );
      expect(ref.current).toBeInstanceOf(HTMLDListElement);
    });
  });

  describe('additional props', () => {
    it('spreads additional props to the element', () => {
      render(
        <DefinitionList data-testid="def-list">
          <dt>Name</dt>
        </DefinitionList>,
      );
      expect(screen.getByTestId('def-list')).toBeInTheDocument();
    });
  });
});
