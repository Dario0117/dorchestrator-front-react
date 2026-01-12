import { ConfirmDialog } from '@components/confirm-dialog';
import type { SignOutDialogProps } from '@components/sign-out-dialog.types';
import { queryClient } from '@context/query.provider';
import { useLogoutMutation } from '@services/users/logout.http-service';
import { useNavigate } from '@tanstack/react-router';

export function SignOutDialog({ open, onOpenChange }: SignOutDialogProps) {
  const navigate = useNavigate();
  const logout = useLogoutMutation({
    handleSuccess: () => {
      queryClient.invalidateQueries();
    },
  });

  const handleSignOut = () => {
    logout.mutate();
    navigate({
      to: '/login',
      replace: true,
      search: window.location.search,
    });
  };

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Sign out"
      desc="Are you sure you want to sign out? You will need to sign in again to access your account."
      confirmText="Sign out"
      handleConfirm={handleSignOut}
      className="sm:max-w-sm"
    />
  );
}
