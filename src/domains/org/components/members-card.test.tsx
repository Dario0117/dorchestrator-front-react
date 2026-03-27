import { renderWithProviders } from '@lib/test-wrappers.utils';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MembersCard } from './members-card';

const mockMembers = [
  {
    id: 'm-1',
    userId: 'u-1',
    name: 'Alice Owner',
    email: 'alice@example.com',
    role: 'owner' as const,
    createdAt: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 'm-2',
    userId: 'u-2',
    name: 'Bob Member',
    email: 'bob@example.com',
    role: 'member' as const,
    createdAt: '2025-02-01T00:00:00.000Z',
  },
];

const defaultProps = {
  members: mockMembers,
  totalResults: 2,
  totalPages: 1,
  hasNext: false,
  hasPrevious: false,
  page: 1,
  size: 25,
  search: undefined,
  role: undefined,
  canManageMembers: true,
  currentUserRole: 'owner',
  currentUserId: 'u-1',
  onPageChange: vi.fn(),
  onSizeChange: vi.fn(),
  onSearch: vi.fn(),
  onRoleChange: vi.fn(),
  onRemoveMember: vi.fn(),
  onTransferOwnership: vi.fn(),
};

describe('MembersCard', () => {
  it('renders card title', () => {
    renderWithProviders(<MembersCard {...defaultProps} />);
    expect(screen.getByText('Members')).toBeInTheDocument();
  });

  it('renders member names and emails', () => {
    renderWithProviders(<MembersCard {...defaultProps} />);
    expect(screen.getByText('Alice Owner')).toBeInTheDocument();
    expect(screen.getByText('alice@example.com')).toBeInTheDocument();
    expect(screen.getByText('Bob Member')).toBeInTheDocument();
    expect(screen.getByText('bob@example.com')).toBeInTheDocument();
  });

  it('renders member roles as badges', () => {
    renderWithProviders(<MembersCard {...defaultProps} />);
    expect(screen.getByText('owner')).toBeInTheDocument();
    expect(screen.getByText('member')).toBeInTheDocument();
  });

  it('renders search input', () => {
    renderWithProviders(<MembersCard {...defaultProps} />);
    expect(
      screen.getByLabelText('Search members by name or email'),
    ).toBeInTheDocument();
  });

  it('shows empty state with filters applied', () => {
    renderWithProviders(
      <MembersCard
        {...defaultProps}
        members={[]}
        search="nonexistent"
      />,
    );
    expect(
      screen.getByText('No members match your filters'),
    ).toBeInTheDocument();
  });

  it('shows empty state without filters', () => {
    renderWithProviders(
      <MembersCard
        {...defaultProps}
        members={[]}
      />,
    );
    expect(screen.getByText('No members found')).toBeInTheDocument();
  });

  it('shows actions column when canManageMembers is true', () => {
    renderWithProviders(<MembersCard {...defaultProps} />);
    expect(screen.getByText('Actions')).toBeInTheDocument();
  });

  it('hides actions column when canManageMembers is false', () => {
    renderWithProviders(
      <MembersCard
        {...defaultProps}
        canManageMembers={false}
      />,
    );
    expect(screen.queryByText('Actions')).not.toBeInTheDocument();
  });

  it('shows transfer ownership button for non-owner members when current user is owner', () => {
    renderWithProviders(<MembersCard {...defaultProps} />);
    expect(screen.getByTitle('Transfer ownership')).toBeInTheDocument();
  });

  it('calls onTransferOwnership when transfer button is clicked', async () => {
    const onTransferOwnership = vi.fn();
    const user = userEvent.setup();
    renderWithProviders(
      <MembersCard
        {...defaultProps}
        onTransferOwnership={onTransferOwnership}
      />,
    );
    await user.click(screen.getByTitle('Transfer ownership'));
    expect(onTransferOwnership).toHaveBeenCalledWith(mockMembers[1]);
  });

  it('calls onRemoveMember when remove button is clicked', async () => {
    const onRemoveMember = vi.fn();
    const user = userEvent.setup();
    renderWithProviders(
      <MembersCard
        {...defaultProps}
        onRemoveMember={onRemoveMember}
      />,
    );
    // Bob is the only non-owner, non-self member with a remove button
    const removeButton = screen
      .getAllByRole('button')
      .filter(
        (btn) => btn.querySelector('.text-destructive') !== null,
      )[0] as HTMLElement;
    await user.click(removeButton);
    expect(onRemoveMember).toHaveBeenCalledWith(mockMembers[1]);
  });

  it('renders info alert about future invitations', () => {
    renderWithProviders(<MembersCard {...defaultProps} />);
    expect(
      screen.getByText(/Member invitations will be available/),
    ).toBeInTheDocument();
  });
});
