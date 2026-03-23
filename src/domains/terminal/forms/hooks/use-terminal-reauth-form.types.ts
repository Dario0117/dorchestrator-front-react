import type { useTerminalAuthMutationType } from '@domains/terminal/services/terminal-auth.http-service';

export interface UseTerminalReauthFormProps {
  authMutation: useTerminalAuthMutationType;
  organizationId: string;
  handleSuccess: (token: string) => void;
}
