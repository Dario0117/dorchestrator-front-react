import { renderWithProviders } from '@lib/test-wrappers.utils';
import { screen } from '@testing-library/react';
import { SidebarItemDetail } from './sidebar-item-detail';

describe('SidebarItemDetail', () => {
  it('renders children text', () => {
    renderWithProviders(<SidebarItemDetail>Item label</SidebarItemDetail>);
    expect(screen.getByText('Item label')).toBeInTheDocument();
  });

  it('renders multiple children', () => {
    renderWithProviders(
      <SidebarItemDetail>
        <span>Title</span>
        <span>Subtitle</span>
      </SidebarItemDetail>,
    );
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Subtitle')).toBeInTheDocument();
  });
});
