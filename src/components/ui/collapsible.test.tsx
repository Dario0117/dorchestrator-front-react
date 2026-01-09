import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@components/ui/collapsible';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

describe('Collapsible', () => {
  it('should render collapsible component', () => {
    render(
      <Collapsible data-testid="collapsible">
        <CollapsibleTrigger>Toggle</CollapsibleTrigger>
        <CollapsibleContent>Content</CollapsibleContent>
      </Collapsible>,
    );
    expect(screen.getByTestId('collapsible')).toBeInTheDocument();
  });

  it('should render trigger button', () => {
    render(
      <Collapsible>
        <CollapsibleTrigger>Toggle</CollapsibleTrigger>
        <CollapsibleContent>Content</CollapsibleContent>
      </Collapsible>,
    );
    expect(screen.getByText('Toggle')).toBeInTheDocument();
  });

  it('should toggle content visibility when trigger is clicked', async () => {
    const user = userEvent.setup();
    render(
      <Collapsible>
        <CollapsibleTrigger>Toggle</CollapsibleTrigger>
        <CollapsibleContent>Content</CollapsibleContent>
      </Collapsible>,
    );
    const trigger = screen.getByText('Toggle');
    await user.click(trigger);
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('should render with data-slot attributes', () => {
    render(
      <Collapsible data-testid="collapsible">
        <CollapsibleTrigger data-testid="trigger">Toggle</CollapsibleTrigger>
        <CollapsibleContent data-testid="content">Content</CollapsibleContent>
      </Collapsible>,
    );
    expect(screen.getByTestId('collapsible')).toHaveAttribute(
      'data-slot',
      'collapsible',
    );
    expect(screen.getByTestId('trigger')).toHaveAttribute(
      'data-slot',
      'collapsible-trigger',
    );
    expect(screen.getByTestId('content')).toHaveAttribute(
      'data-slot',
      'collapsible-content',
    );
  });

  it('should accept additional props', () => {
    render(
      <Collapsible aria-label="Collapsible section">
        <CollapsibleTrigger>Toggle</CollapsibleTrigger>
        <CollapsibleContent>Content</CollapsibleContent>
      </Collapsible>,
    );
    expect(screen.getByLabelText('Collapsible section')).toBeInTheDocument();
  });
});
