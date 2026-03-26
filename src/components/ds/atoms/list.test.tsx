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
});
