import {
  SelectableList,
  SelectableListItem,
} from '@components/ds/atoms/selectable-list';
import { renderWithProviders } from '@lib/test-wrappers.utils';
import { screen } from '@testing-library/react';

describe('SelectableList', () => {
  it('renders items', () => {
    renderWithProviders(
      <SelectableList>
        <SelectableListItem>Option A</SelectableListItem>
        <SelectableListItem>Option B</SelectableListItem>
      </SelectableList>,
    );
    expect(screen.getByText('Option A')).toBeInTheDocument();
    expect(screen.getByText('Option B')).toBeInTheDocument();
  });

  it('renders as a ul element', () => {
    renderWithProviders(
      <SelectableList>
        <SelectableListItem>Option</SelectableListItem>
      </SelectableList>,
    );
    expect(screen.getByRole('list')).toBeInTheDocument();
  });

  it('renders active item with aria-current when provided', () => {
    renderWithProviders(
      <SelectableList>
        <SelectableListItem
          active
          aria-current="true"
        >
          Active
        </SelectableListItem>
        <SelectableListItem>Inactive</SelectableListItem>
      </SelectableList>,
    );
    expect(screen.getByText('Active')).toHaveAttribute('aria-current', 'true');
    expect(screen.getByText('Inactive')).not.toHaveAttribute('aria-current');
  });
});
