import type { useTerminalAuthMutationType } from '@domains/terminal/services/terminal-auth.http-service';

export interface TerminalReauthFormProps {
  authMutation: useTerminalAuthMutationType;
  organizationId: string;
  handleSuccess: (token: string) => void;
}
