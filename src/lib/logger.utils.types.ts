export interface LogContext {
  message: string;
  error?: unknown;
  attributes?: Record<string, unknown>;
}
