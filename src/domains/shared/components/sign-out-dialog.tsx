import { useLogoutMutation } from '@domains/org/services/users/logout.http-service';
import { ConfirmDialog } from '@domains/shared/components/confirm-dialog';
import type { SignOutDialogProps } from '@domains/shared/components/sign-out-dialog.types';

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
      size="narrow"
    />
  );
}
