import { renderWithProviders } from '@lib/test-wrappers.utils';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DangerZoneCard } from './danger-zone-card';

const defaultProps = {
  currentUserRole: 'member',
  leaveIsPending: false,
  leaveIsError: false,
  deleteIsPending: false,
  deleteIsError: false,
  onLeave: vi.fn(),
  onDelete: vi.fn(),
};

describe('DangerZoneCard', () => {
  it('renders card title', () => {
    renderWithProviders(<DangerZoneCard {...defaultProps} />);
    expect(screen.getByText('Danger Zone')).toBeInTheDocument();
  });

  describe('leave organization', () => {
    it('shows leave button for members', () => {
      renderWithProviders(
        <DangerZoneCard
          {...defaultProps}
          currentUserRole="member"
        />,
      );
      expect(
        screen.getByRole('button', { name: /Leave Organization/ }),
      ).toBeInTheDocument();
    });

    it('shows transfer ownership message for owners', () => {
      renderWithProviders(
        <DangerZoneCard
          {...defaultProps}
          currentUserRole="owner"
        />,
      );
      expect(
        screen.getByText(/must transfer ownership before you can leave/),
      ).toBeInTheDocument();
    });

    it('shows removal message for admins', () => {
      renderWithProviders(
        <DangerZoneCard
          {...defaultProps}
          currentUserRole="admin"
        />,
      );
      expect(
        screen.getByText(/Admins cannot leave an organization/),
      ).toBeInTheDocument();
    });

    it('calls onLeave when leave button is clicked', async () => {
      const onLeave = vi.fn();
      const user = userEvent.setup();
      renderWithProviders(
        <DangerZoneCard
          {...defaultProps}
          onLeave={onLeave}
        />,
      );
      await user.click(
        screen.getByRole('button', { name: /Leave Organization/ }),
      );
      expect(onLeave).toHaveBeenCalledOnce();
    });

    it('disables leave button when pending', () => {
      renderWithProviders(
        <DangerZoneCard
          {...defaultProps}
          leaveIsPending
        />,
      );
      expect(screen.getByRole('button', { name: /Leaving/ })).toBeDisabled();
    });

    it('shows error alert when leave fails', () => {
      renderWithProviders(
        <DangerZoneCard
          {...defaultProps}
          leaveIsError
        />,
      );
      expect(
        screen.getByText(/Failed to leave organization/),
      ).toBeInTheDocument();
    });
  });

  describe('delete organization', () => {
    it('shows delete button for owners', () => {
      renderWithProviders(
        <DangerZoneCard
          {...defaultProps}
          currentUserRole="owner"
        />,
      );
      expect(
        screen.getByRole('button', { name: /Delete Organization/ }),
      ).toBeInTheDocument();
    });

    it('shows owner-only message for non-owners', () => {
      renderWithProviders(
        <DangerZoneCard
          {...defaultProps}
          currentUserRole="member"
        />,
      );
      expect(
        screen.getByText(/Only the organization owner can delete/),
      ).toBeInTheDocument();
    });

    it('calls onDelete when delete button is clicked', async () => {
      const onDelete = vi.fn();
      const user = userEvent.setup();
      renderWithProviders(
        <DangerZoneCard
          {...defaultProps}
          currentUserRole="owner"
          onDelete={onDelete}
        />,
      );
      await user.click(
        screen.getByRole('button', { name: /Delete Organization/ }),
      );
      expect(onDelete).toHaveBeenCalledOnce();
    });

    it('disables delete button when pending', () => {
      renderWithProviders(
        <DangerZoneCard
          {...defaultProps}
          currentUserRole="owner"
          deleteIsPending
        />,
      );
      expect(screen.getByRole('button', { name: /Deleting/ })).toBeDisabled();
    });

    it('shows error alert when delete fails', () => {
      renderWithProviders(
        <DangerZoneCard
          {...defaultProps}
          deleteIsError
        />,
      );
      expect(
        screen.getByText(/Failed to delete organization/),
      ).toBeInTheDocument();
    });
  });
});
