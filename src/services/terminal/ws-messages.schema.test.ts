import {
  errorMessageSchema,
  heartbeatPingSchema,
  heartbeatPongSchema,
  wsMessageSchema,
} from '@services/terminal/ws-messages.schema';

describe('ws-messages.schema', () => {
  describe('wsMessageSchema discriminated union', () => {
    test('parses pty:input message', () => {
      const msg = { type: 'pty:input', sessionId: 's1', data: 'ls\n' };
      const result = wsMessageSchema.safeParse(msg);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(msg);
      }
    });

    test('parses pty:output message', () => {
      const msg = { type: 'pty:output', sessionId: 's1', data: 'output' };
      const result = wsMessageSchema.safeParse(msg);
      expect(result.success).toBe(true);
    });

    test('parses pty:resize message', () => {
      const msg = {
        type: 'pty:resize',
        sessionId: 's1',
        payload: { cols: 80, rows: 24 },
      };
      const result = wsMessageSchema.safeParse(msg);
      expect(result.success).toBe(true);
    });

    test('parses session:create message', () => {
      const msg = {
        type: 'session:create',
        payload: { deviceId: 1, cols: 80, rows: 24 },
      };
      const result = wsMessageSchema.safeParse(msg);
      expect(result.success).toBe(true);
    });

    test('parses session:create without optional cols/rows', () => {
      const msg = { type: 'session:create', payload: { deviceId: 1 } };
      const result = wsMessageSchema.safeParse(msg);
      expect(result.success).toBe(true);
    });

    test('parses session:close message', () => {
      const msg = { type: 'session:close', sessionId: 's1' };
      const result = wsMessageSchema.safeParse(msg);
      expect(result.success).toBe(true);
    });

    test('parses session:lock message', () => {
      const msg = { type: 'session:lock', sessionId: 's1' };
      const result = wsMessageSchema.safeParse(msg);
      expect(result.success).toBe(true);
    });

    test('parses session:unlock message', () => {
      const msg = { type: 'session:unlock', sessionId: 's1' };
      const result = wsMessageSchema.safeParse(msg);
      expect(result.success).toBe(true);
    });

    test('parses command:notify message', () => {
      const msg = {
        type: 'command:notify',
        payload: { commandId: 42, deviceId: 'device-abc' },
      };
      const result = wsMessageSchema.safeParse(msg);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(msg);
      }
    });

    test('rejects command:notify without required payload fields', () => {
      const msg = {
        type: 'command:notify',
        payload: {},
      };
      const result = wsMessageSchema.safeParse(msg);
      expect(result.success).toBe(false);
    });

    test('parses command:dispatch message', () => {
      const msg = {
        type: 'command:dispatch',
        payload: { commandId: 10, deviceId: 'device-xyz', status: 'completed' },
      };
      const result = wsMessageSchema.safeParse(msg);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(msg);
      }
    });

    test('parses command:dispatch with optional deviceName', () => {
      const msg = {
        type: 'command:dispatch',
        sessionId: 's1',
        payload: {
          commandId: 5,
          deviceId: 'device-1',
          status: 'running',
          deviceName: 'My Server',
        },
      };
      const result = wsMessageSchema.safeParse(msg);
      expect(result.success).toBe(true);
    });

    test('rejects command:dispatch without required status field', () => {
      const msg = {
        type: 'command:dispatch',
        payload: { commandId: 10, deviceId: 'device-1' },
      };
      const result = wsMessageSchema.safeParse(msg);
      expect(result.success).toBe(false);
    });

    test('parses heartbeat:ping message', () => {
      const result = heartbeatPingSchema.safeParse({ type: 'heartbeat:ping' });
      expect(result.success).toBe(true);
    });

    test('parses heartbeat:pong message', () => {
      const result = heartbeatPongSchema.safeParse({ type: 'heartbeat:pong' });
      expect(result.success).toBe(true);
    });

    test('parses error message', () => {
      const msg = {
        type: 'error',
        payload: { code: 'AUTH_FAILED', message: 'Invalid token' },
      };
      const result = errorMessageSchema.safeParse(msg);
      expect(result.success).toBe(true);
    });

    test('rejects unknown message type', () => {
      const msg = { type: 'unknown:type', data: 'test' };
      const result = wsMessageSchema.safeParse(msg);
      expect(result.success).toBe(false);
    });

    test('rejects message missing required fields', () => {
      const msg = { type: 'pty:input' };
      const result = wsMessageSchema.safeParse(msg);
      expect(result.success).toBe(false);
    });

    test('rejects pty:resize with non-positive cols', () => {
      const msg = {
        type: 'pty:resize',
        sessionId: 's1',
        payload: { cols: 0, rows: 24 },
      };
      const result = wsMessageSchema.safeParse(msg);
      expect(result.success).toBe(false);
    });
  });
});
