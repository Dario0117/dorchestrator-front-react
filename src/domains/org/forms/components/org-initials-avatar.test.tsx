import { renderWithProviders } from '@lib/test-wrappers.utils';
import { screen } from '@testing-library/react';
import { OrgInitialsAvatar } from './org-initials-avatar';

describe('OrgInitialsAvatar', () => {
  it('renders the provided initials', () => {
    renderWithProviders(<OrgInitialsAvatar initials="DO" />);
    expect(screen.getByText('DO')).toBeInTheDocument();
  });

  it('renders single character initials', () => {
    renderWithProviders(<OrgInitialsAvatar initials="A" />);
    expect(screen.getByText('A')).toBeInTheDocument();
  });
});
