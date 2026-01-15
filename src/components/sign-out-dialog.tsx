import { ConfirmDialog } from '@components/confirm-dialog';
import type { SignOutDialogProps } from '@components/sign-out-dialog.types';
import { useLogoutMutation } from '@services/users/logout.http-service';

export function SignOutDialog({ open, onOpenChange }: SignOutDialogProps) {
  const logout = useLogoutMutation({
    handleSuccess: () => {
      window.location.href = '/login';
    },
  });

  const handleSignOut = () => {
    logout.mutate();
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
