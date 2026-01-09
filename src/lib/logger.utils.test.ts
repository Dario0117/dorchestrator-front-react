import { logError, logInfo, logWarning } from '@lib/logger.utils';
import type { LogContext } from '@lib/logger.utils.types';

describe('logger utils', () => {
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;
  let consoleInfoSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => null);
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => null);
    consoleInfoSpy = vi.spyOn(console, 'info').mockImplementation(() => null);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('logWarning', () => {
    it('should call console.warn with the message', () => {
      const ctx: LogContext = {
        message: 'This is a warning message',
      };

      logWarning(ctx);

      expect(consoleWarnSpy).toHaveBeenCalledWith('This is a warning message');
      expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
    });

    it('should handle LogContext with error property', () => {
      const ctx: LogContext = {
        message: 'Warning with error context',
        error: 'Additional error details',
      };

      logWarning(ctx);

      expect(consoleWarnSpy).toHaveBeenCalledWith('Warning with error context');
      expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
    });

    it('should handle empty message', () => {
      const ctx: LogContext = {
        message: '',
      };

      logWarning(ctx);

      expect(consoleWarnSpy).toHaveBeenCalledWith('');
      expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('logError', () => {
    it('should call console.error with the message', () => {
      const ctx: LogContext = {
        message: 'This is an error message',
      };

      logError(ctx);

      expect(consoleErrorSpy).toHaveBeenCalledWith('This is an error message');
      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    });

    it('should handle LogContext with error property', () => {
      const ctx: LogContext = {
        message: 'Error with additional context',
        error: 'Stack trace or error details',
      };

      logError(ctx);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error with additional context',
      );
      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    });

    it('should handle multiline error messages', () => {
      const ctx: LogContext = {
        message: 'Error occurred:\\nDetails: Something went wrong',
      };

      logError(ctx);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error occurred:\\nDetails: Something went wrong',
      );
      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('logInfo', () => {
    it('should call console.info with the message', () => {
      const ctx: LogContext = {
        message: 'This is an info message',
      };

      logInfo(ctx);

      expect(consoleInfoSpy).toHaveBeenCalledWith('This is an info message');
      expect(consoleInfoSpy).toHaveBeenCalledTimes(1);
    });

    it('should handle LogContext with error property', () => {
      const ctx: LogContext = {
        message: 'Info with context',
        error: 'Additional information',
      };

      logInfo(ctx);

      expect(consoleInfoSpy).toHaveBeenCalledWith('Info with context');
      expect(consoleInfoSpy).toHaveBeenCalledTimes(1);
    });

    it('should handle special characters in message', () => {
      const ctx: LogContext = {
        message: 'Info: User "John Doe" logged in at 2023-12-01T10:30:00Z',
      };

      logInfo(ctx);

      expect(consoleInfoSpy).toHaveBeenCalledWith(
        'Info: User "John Doe" logged in at 2023-12-01T10:30:00Z',
      );
      expect(consoleInfoSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('all loggers', () => {
    it('should not interfere with each other', () => {
      const warningCtx: LogContext = { message: 'Warning message' };
      const errorCtx: LogContext = { message: 'Error message' };
      const infoCtx: LogContext = { message: 'Info message' };

      logWarning(warningCtx);
      logError(errorCtx);
      logInfo(infoCtx);

      expect(consoleWarnSpy).toHaveBeenCalledWith('Warning message');
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error message');
      expect(consoleInfoSpy).toHaveBeenCalledWith('Info message');

      expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
      expect(consoleInfoSpy).toHaveBeenCalledTimes(1);
    });
  });
});
