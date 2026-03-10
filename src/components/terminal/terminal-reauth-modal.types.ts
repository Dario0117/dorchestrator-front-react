export interface TerminalReauthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationId: string;
  onSuccess: (token: string) => void;
}
