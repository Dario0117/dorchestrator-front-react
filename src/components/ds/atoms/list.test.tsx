import { List, ListItem } from '@components/ds/atoms/list';
import { renderWithProviders } from '@lib/test-wrappers.utils';
import { screen } from '@testing-library/react';

describe('List', () => {
  it('renders items', () => {
    renderWithProviders(
      <List>
        <ListItem>Item 1</ListItem>
        <ListItem>Item 2</ListItem>
      </List>,
    );
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
  });

  it('renders as a ul element', () => {
    renderWithProviders(
      <List>
        <ListItem>Item</ListItem>
      </List>,
    );
    expect(screen.getByRole('list')).toBeInTheDocument();
  });

  it('renders list items as li elements', () => {
    renderWithProviders(
      <List>
        <ListItem>Item</ListItem>
      </List>,
    );
    expect(screen.getByRole('listitem')).toBeInTheDocument();
  });

  describe('variant', () => {
    it('applies default variant with list-disc', () => {
      renderWithProviders(
        <List>
          <ListItem>Item</ListItem>
        </List>,
      );
      expect(screen.getByRole('list')).toHaveClass('list-disc', 'pl-4');
    });

    it('applies error variant with destructive text', () => {
      renderWithProviders(
        <List variant="error">
          <ListItem>Error item</ListItem>
        </List>,
      );
      expect(screen.getByRole('list')).toHaveClass(
        'text-sm',
        'text-destructive',
      );
    });
  });

  it('spreads additional props on List', () => {
    renderWithProviders(
      <List data-testid="list">
        <ListItem>Item</ListItem>
      </List>,
    );
    expect(screen.getByTestId('list')).toBeInTheDocument();
  });

  it('spreads additional props on ListItem', () => {
    renderWithProviders(
      <List>
        <ListItem data-testid="item">Item</ListItem>
      </List>,
    );
    expect(screen.getByTestId('item')).toBeInTheDocument();
  });
});
