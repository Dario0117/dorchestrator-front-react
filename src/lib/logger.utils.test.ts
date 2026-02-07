import { logDebug, logError, logInfo, logWarning } from '@lib/logger.utils';

describe('logger utils', () => {
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;
  let consoleInfoSpy: ReturnType<typeof vi.spyOn>;
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => null);
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => null);
    consoleInfoSpy = vi.spyOn(console, 'info').mockImplementation(() => null);
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => null);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('logWarning', () => {
    it('should call console.warn with the message and structured log', () => {
      logWarning({}, 'This is a warning message');

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'This is a warning message',
        expect.objectContaining({
          msg: 'This is a warning message',
          timestamp: expect.any(String),
        }),
      );
      expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
    });

    it('should handle LogContext with error property', () => {
      logWarning(
        { error: 'Additional error details' },
        'Warning with error context',
      );

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Warning with error context',
        expect.objectContaining({
          msg: 'Warning with error context',
          error: 'Additional error details',
        }),
      );
      expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
    });

    it('should handle empty message', () => {
      logWarning({}, '');

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        '',
        expect.objectContaining({ msg: '' }),
      );
      expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('logError', () => {
    it('should call console.error with the message and structured log', () => {
      logError({}, 'This is an error message');

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'This is an error message',
        expect.objectContaining({
          msg: 'This is an error message',
          timestamp: expect.any(String),
        }),
      );
      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    });

    it('should handle LogContext with error property', () => {
      logError(
        { error: 'Stack trace or error details' },
        'Error with additional context',
      );

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error with additional context',
        expect.objectContaining({
          msg: 'Error with additional context',
          error: 'Stack trace or error details',
        }),
      );
      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    });

    it('should handle multiline error messages', () => {
      logError({}, 'Error occurred:\\nDetails: Something went wrong');

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error occurred:\\nDetails: Something went wrong',
        expect.objectContaining({
          msg: 'Error occurred:\\nDetails: Something went wrong',
        }),
      );
      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('logInfo', () => {
    it('should call console.info with the message and structured log', () => {
      logInfo({}, 'This is an info message');

      expect(consoleInfoSpy).toHaveBeenCalledWith(
        'This is an info message',
        expect.objectContaining({
          msg: 'This is an info message',
          timestamp: expect.any(String),
        }),
      );
      expect(consoleInfoSpy).toHaveBeenCalledTimes(1);
    });

    it('should handle LogContext with error property', () => {
      logInfo({ error: 'Additional information' }, 'Info with context');

      expect(consoleInfoSpy).toHaveBeenCalledWith(
        'Info with context',
        expect.objectContaining({
          msg: 'Info with context',
          error: 'Additional information',
        }),
      );
      expect(consoleInfoSpy).toHaveBeenCalledTimes(1);
    });

    it('should handle special characters in message', () => {
      logInfo({}, 'Info: User "John Doe" logged in at 2023-12-01T10:30:00Z');

      expect(consoleInfoSpy).toHaveBeenCalledWith(
        'Info: User "John Doe" logged in at 2023-12-01T10:30:00Z',
        expect.objectContaining({
          msg: 'Info: User "John Doe" logged in at 2023-12-01T10:30:00Z',
        }),
      );
      expect(consoleInfoSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('logDebug', () => {
    it('should call console.log with the message and structured log', () => {
      logDebug({}, 'Debug message');

      expect(consoleLogSpy).toHaveBeenCalledWith(
        'Debug message',
        expect.objectContaining({
          msg: 'Debug message',
          timestamp: expect.any(String),
        }),
      );
      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('structured log includes attributes', () => {
    it('should include custom attributes in the log output', () => {
      logInfo({ userId: 'abc123', action: 'login' }, 'Action completed');

      expect(consoleInfoSpy).toHaveBeenCalledWith(
        'Action completed',
        expect.objectContaining({
          msg: 'Action completed',
          userId: 'abc123',
          action: 'login',
        }),
      );
    });
  });

  describe('all loggers', () => {
    it('should not interfere with each other', () => {
      logWarning({}, 'Warning message');
      logError({}, 'Error message');
      logInfo({}, 'Info message');

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Warning message',
        expect.objectContaining({ msg: 'Warning message' }),
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error message',
        expect.objectContaining({ msg: 'Error message' }),
      );
      expect(consoleInfoSpy).toHaveBeenCalledWith(
        'Info message',
        expect.objectContaining({ msg: 'Info message' }),
      );

      expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
      expect(consoleInfoSpy).toHaveBeenCalledTimes(1);
    });
  });
});
