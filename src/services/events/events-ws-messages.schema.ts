import { z } from 'zod';

// =============================================================================
// Server → Browser messages
// =============================================================================

export const notificationChangedSchema = z.object({
  type: z.literal('notification:changed'),
});

export const eventsHeartbeatPingSchema = z.object({
  type: z.literal('heartbeat:ping'),
});

// =============================================================================
// Browser → Server messages
// =============================================================================

export const eventsHeartbeatPongSchema = z.object({
  type: z.literal('heartbeat:pong'),
});

// =============================================================================
// Union
// =============================================================================

export const eventsWsMessageSchema = z.discriminatedUnion('type', [
  notificationChangedSchema,
  eventsHeartbeatPingSchema,
  eventsHeartbeatPongSchema,
]);

export type EventsWsMessage = z.infer<typeof eventsWsMessageSchema>;
export type EventsWsMessageType = EventsWsMessage['type'];
