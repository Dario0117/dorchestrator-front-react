import { ConfirmDialog } from '@components/confirm-dialog';
import type { SignOutDialogProps } from '@components/sign-out-dialog.types';
import { useLogoutMutation } from '@services/users/logout.http-service';
import { useAuthenticationStore } from '@stores/authentication.store';

export function SignOutDialog({ open, onOpenChange }: SignOutDialogProps) {
  const { setProfile } = useAuthenticationStore();
  const logout = useLogoutMutation({
    handleSuccess: () => {
      setProfile(undefined);
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
