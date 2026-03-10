import { TerminalReauthForm } from '@components/terminal/forms/terminal-reauth.form';
import type { TerminalReauthModalProps } from '@components/terminal/terminal-reauth-modal.types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@components/ui/dialog';
import { useTerminalAuthMutation } from '@services/terminal/terminal-auth.http-service';

export function TerminalReauthModal({
  open,
  onOpenChange,
  organizationId,
  onSuccess,
}: TerminalReauthModalProps) {
  const authMutation = useTerminalAuthMutation();

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      authMutation.reset();
    }
    onOpenChange(nextOpen);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={handleOpenChange}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Terminal Authentication</DialogTitle>
          <DialogDescription>
            Enter your password to open a terminal session.
          </DialogDescription>
        </DialogHeader>
        <TerminalReauthForm
          authMutation={authMutation}
          organizationId={organizationId}
          handleSuccess={onSuccess}
        />
      </DialogContent>
    </Dialog>
  );
}
