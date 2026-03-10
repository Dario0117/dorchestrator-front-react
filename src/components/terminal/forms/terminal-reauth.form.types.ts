import type { useTerminalAuthMutationType } from '@services/terminal/terminal-auth.http-service';

export interface TerminalReauthFormProps {
  authMutation: useTerminalAuthMutationType;
  organizationId: string;
  handleSuccess: (token: string) => void;
}
