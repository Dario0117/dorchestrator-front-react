import { useExtendTerminalSessionMutation } from '@services/terminal/extend-terminal-session.http-service';
import { terminalWsClient } from '@services/terminal/terminal-ws.client';
import { useNavigate } from '@tanstack/react-router';
import { useCallback, useEffect, useState } from 'react';

const CLOSE_TIMEOUT_MS = 10_000;

export function useTerminalSessionLifecycle({
  organizationId,
  sessionId,
}: {
  organizationId: string;
  sessionId: string;
}) {
  const navigate = useNavigate();
  const [isClosing, setIsClosing] = useState(false);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);
  const [showExtendReauth, setShowExtendReauth] = useState(false);
  const extendMutation = useExtendTerminalSessionMutation();

  const handleSessionEnd = useCallback(() => {
    navigate({ to: '..', replace: true });
  }, [navigate]);

  const handleSessionWarning = useCallback(
    (reason: string, remainingMs: number) => {
      const minutes = Math.ceil(remainingMs / 60_000);
      const label =
        reason === 'hard_cap_expiry'
          ? 'session duration limit'
          : 'absolute maximum lifetime';
      setWarningMessage(
        `This session will be terminated in ~${minutes} min due to ${label}.`,
      );
    },
    [],
  );

  useEffect(() => {
    if (!isClosing) {
      return;
    }
    const timer = setTimeout(() => {
      navigate({ to: '..', replace: true });
    }, CLOSE_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [isClosing, navigate]);

  const handleExtendSuccess = useCallback(
    (token: string) => {
      extendMutation.mutate(
        {
          params: {
            path: { organizationId, sessionId: Number(sessionId) },
          },
          body: { reauthToken: token },
        },
        {
          onSuccess: () => {
            setShowExtendReauth(false);
            setWarningMessage(null);
          },
        },
      );
    },
    [organizationId, sessionId, extendMutation],
  );

  const handleCloseSession = useCallback(() => {
    setIsClosing(true);
    terminalWsClient.send({
      type: 'session:close',
      sessionId,
    });
  }, [sessionId]);

  return {
    isClosing,
    warningMessage,
    showExtendReauth,
    setShowExtendReauth,
    isExtendError: extendMutation.isError,
    handleSessionEnd,
    handleSessionWarning,
    handleExtendSuccess,
    handleCloseSession,
  };
}
