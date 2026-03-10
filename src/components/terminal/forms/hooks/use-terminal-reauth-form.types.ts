import type { useTerminalAuthMutationType } from '@services/terminal/terminal-auth.http-service';

export interface UseTerminalReauthFormProps {
  authMutation: useTerminalAuthMutationType;
  organizationId: string;
  handleSuccess: (token: string) => void;
}
