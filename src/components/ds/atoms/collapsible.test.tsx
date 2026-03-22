import { clickTrigger } from '@lib/test-wrappers.utils';
import { render, screen } from '@testing-library/react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from './collapsible';

describe('Collapsible', () => {
  describe('rendering', () => {
    it('renders trigger', () => {
      render(
        <Collapsible>
          <CollapsibleTrigger>Toggle</CollapsibleTrigger>
          <CollapsibleContent>Hidden content</CollapsibleContent>
        </Collapsible>,
      );
      expect(screen.getByText('Toggle')).toBeInTheDocument();
    });
  });

  describe('interaction', () => {
    it('shows content when trigger is clicked', async () => {
      render(
        <Collapsible>
          <CollapsibleTrigger>Toggle</CollapsibleTrigger>
          <CollapsibleContent>Revealed content</CollapsibleContent>
        </Collapsible>,
      );

      await clickTrigger(screen.getByText('Toggle'));
      expect(screen.getByText('Revealed content')).toBeInTheDocument();
    });
  });

  describe('additional props', () => {
    it('spreads additional props to the element', () => {
      render(
        <Collapsible data-testid="collapsible">
          <CollapsibleTrigger>Toggle</CollapsibleTrigger>
          <CollapsibleContent>Content</CollapsibleContent>
        </Collapsible>,
      );
      expect(screen.getByTestId('collapsible')).toBeInTheDocument();
    });
  });
});
