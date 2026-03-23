export interface TerminalEmulatorProps {
  sessionId: string;
  fontSize?: number;
  readOnly?: boolean;
  shareToken?: string;
  onSessionEnd?: (deviceId?: number) => void;
  onSessionLocked?: () => void;
  onSessionWarning?: (reason: string, remainingMs: number) => void;
  onSessionTerminated?: () => void;
}

export interface TerminalEmulatorHandle {
  focus: () => void;
}
