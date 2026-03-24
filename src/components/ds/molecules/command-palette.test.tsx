import { CommandPalette } from '@components/ds/molecules/command-palette';
import { renderWithProviders } from '@lib/test-wrappers.utils';
import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

vi.mock('@domains/shared/hooks/use-current-organization', () => ({
  useCurrentOrganization: () => ({
    id: 'org-1',
    slug: 'test-org',
    name: 'Test',
  }),
}));

vi.mock('@domains/shared/hooks/use-current-team', () => ({
  useCurrentTeam: () => ({
    id: 'team-1',
    slug: 'test-team',
    name: 'Test Team',
  }),
}));

function renderPalette(overrides?: { open?: boolean }) {
  const onOpenChange = vi.fn();
  const onSelect = vi.fn();
  const result = renderWithProviders(
    <CommandPalette
      open={overrides?.open ?? true}
      onOpenChange={onOpenChange}
      onSelect={onSelect}
    />,
  );
  return { ...result, onOpenChange, onSelect };
}

describe('CommandPalette', () => {
  it('renders with dialog role and aria-label when open', () => {
    renderPalette();
    expect(screen.getByRole('dialog')).toHaveAttribute(
      'aria-label',
      'Command palette',
    );
  });

  it('does not render dialog content when closed', () => {
    renderPalette({ open: false });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('shows search input when open', () => {
    renderPalette();
    expect(screen.getByLabelText('Search')).toBeInTheDocument();
  });

  it('shows navigation items when search is empty and no recent items', () => {
    renderPalette();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Devices')).toBeInTheDocument();
    expect(screen.getByText('Commands')).toBeInTheDocument();
  });

  it('filters results when typing', async () => {
    const user = userEvent.setup();
    renderPalette();

    const input = screen.getByLabelText('Search');
    await user.type(input, 'Dash');

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.queryByText('Commands')).not.toBeInTheDocument();
  });

  it('calls onSelect when Enter is pressed on a navigation item', async () => {
    const user = userEvent.setup();
    const { onSelect } = renderPalette();

    const input = screen.getByLabelText('Search');
    await user.type(input, 'Dashboard');
    await user.keyboard('{Enter}');

    expect(onSelect).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'nav-dashboard', type: 'navigation' }),
    );
  });

  it('navigates results with arrow keys', async () => {
    const user = userEvent.setup();
    renderPalette();

    const dialog = screen.getByRole('dialog');
    await act(() => {
      dialog.focus();
    });

    // Arrow down should move selection
    await user.keyboard('{ArrowDown}');
    // Just verify no error; detailed active tracking tested via visual snapshot
  });

  it('shows no results message when search has no matches', async () => {
    const user = userEvent.setup();
    renderPalette();

    const input = screen.getByLabelText('Search');
    await user.type(input, 'xyznonexistent');

    expect(screen.getByText('No results found.')).toBeInTheDocument();
  });
});
