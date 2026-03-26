import { COMMAND_STATUSES } from '@domains/commands/services/list-commands.http-service.constants';
import { z } from 'zod/v4';
import type { operations } from '@/types/api.generated.types';

// Session status type extracted from generated API types (source of truth)
type ApiSessionStatus = NonNullable<
  operations['getApiV1ByOrganizationIdTeamsByTeamIdTerminalSessions']['parameters']['query']['status']
>;

// =============================================================================
// Individual Message Schemas
// =============================================================================

// PTY Messages
const ptyInputSchema = z.object({
  type: z.literal('pty:input'),
  sessionId: z.string(),
  data: z.string(),
});

const ptyOutputSchema = z.object({
  type: z.literal('pty:output'),
  sessionId: z.string(),
  data: z.string(),
});

const ptyResizeSchema = z.object({
  type: z.literal('pty:resize'),
  sessionId: z.string(),
  payload: z.object({
    cols: z.number().int().positive(),
    rows: z.number().int().positive(),
  }),
});

// Session Messages
const sessionCreateSchema = z.object({
  type: z.literal('session:create'),
  payload: z.object({
    deviceId: z.number().int().positive(),
    cols: z.number().int().positive().optional(),
    rows: z.number().int().positive().optional(),
  }),
});

const sessionCloseSchema = z.object({
  type: z.literal('session:close'),
  sessionId: z.string(),
  deviceId: z.number().int().positive().optional(),
});

const sessionLockSchema = z.object({
  type: z.literal('session:lock'),
  sessionId: z.string(),
});

const sessionUnlockSchema = z.object({
  type: z.literal('session:unlock'),
  sessionId: z.string(),
});

const SESSION_WARNING_REASONS = [
  'hard_cap_expiry',
  'absolute_max_expiry',
] as const;

const sessionWarningSchema = z.object({
  type: z.literal('session:warning'),
  sessionId: z.string(),
  payload: z.object({
    reason: z.enum(SESSION_WARNING_REASONS),
    remainingMs: z.number(),
  }),
});

const sessionExtendedSchema = z.object({
  type: z.literal('session:extended'),
  sessionId: z.string(),
  payload: z.object({
    remainingMaxMs: z.number(),
  }),
});

// Command Messages
const commandNotifySchema = z.object({
  type: z.literal('command:notify'),
  sessionId: z.string().optional(),
  payload: z.object({
    commandId: z.number(),
    deviceId: z.string(),
  }),
});

const commandDispatchSchema = z.object({
  type: z.literal('command:dispatch'),
  sessionId: z.string().optional(),
  payload: z.object({
    commandId: z.number(),
    deviceId: z.string(),
    status: z.enum(COMMAND_STATUSES),
    deviceName: z.string().optional(),
  }),
});

// Viewer Messages
const viewerJoinSchema = z.object({
  type: z.literal('viewer:join'),
  sessionId: z.string(),
  payload: z.object({
    userId: z.string(),
    displayName: z.string(),
  }),
});

const viewerLeaveSchema = z.object({
  type: z.literal('viewer:leave'),
  sessionId: z.string(),
  payload: z
    .object({
      userId: z.string(),
    })
    .optional(),
});

const viewerListRequestSchema = z.object({
  type: z.literal('viewer:list:request'),
  sessionId: z.string(),
});

const viewerListSchema = z.object({
  type: z.literal('viewer:list'),
  sessionId: z.string(),
  payload: z.object({
    viewers: z.array(
      z.object({
        userId: z.string(),
        displayName: z.string(),
      }),
    ),
  }),
});

// Suggestion notification messages (server → client, thin signal — frontend fetches full data via REST)
const suggestionNotifySchema = z.object({
  type: z.literal('suggestion:notify'),
  sessionId: z.string(),
  payload: z.object({
    suggestionId: z.number(),
  }),
});

const suggestionAcceptedSchema = z.object({
  type: z.literal('suggestion:accepted'),
  sessionId: z.string(),
  payload: z.object({
    suggestionId: z.number(),
  }),
});

const suggestionDismissedSchema = z.object({
  type: z.literal('suggestion:dismissed'),
  sessionId: z.string(),
  payload: z.object({
    suggestionId: z.number(),
  }),
});

// Session Status Update (server-to-client broadcast)
const SESSION_STATUSES = [
  'created',
  'active',
  'locked',
  'terminated',
] as const satisfies readonly ApiSessionStatus[];

const sessionStatusSchema = z.object({
  type: z.literal('session:status'),
  sessionId: z.string(),
  payload: z.object({
    status: z.enum(SESSION_STATUSES),
    previousStatus: z.string(),
  }),
});

// Heartbeat Messages
const heartbeatPingSchema = z.object({
  type: z.literal('heartbeat:ping'),
});

const heartbeatPongSchema = z.object({
  type: z.literal('heartbeat:pong'),
});

// File Transfer Messages (ID-based — agent downloads via its own HTTP client)
const fileTransferSchema = z.object({
  type: z.literal('file:transfer'),
  sessionId: z.string(),
  payload: z.object({
    fileId: z.number(),
    filename: z.string(),
    mimeType: z.string(),
    sizeBytes: z.number(),
  }),
});

// Error Message
const errorMessageSchema = z.object({
  type: z.literal('error'),
  payload: z.object({
    code: z.string(),
    message: z.string(),
  }),
});

// =============================================================================
// Discriminated Union (Source of Truth)
// =============================================================================

export const wsMessageSchema = z.discriminatedUnion('type', [
  ptyInputSchema,
  ptyOutputSchema,
  ptyResizeSchema,
  sessionCreateSchema,
  sessionCloseSchema,
  sessionLockSchema,
  sessionUnlockSchema,
  sessionWarningSchema,
  sessionExtendedSchema,
  sessionStatusSchema,
  commandNotifySchema,
  commandDispatchSchema,
  viewerJoinSchema,
  viewerLeaveSchema,
  viewerListRequestSchema,
  viewerListSchema,
  suggestionNotifySchema,
  suggestionAcceptedSchema,
  suggestionDismissedSchema,
  fileTransferSchema,
  heartbeatPingSchema,
  heartbeatPongSchema,
  errorMessageSchema,
]);

// =============================================================================
// Exported Individual Schemas
// =============================================================================

export {
  ptyInputSchema,
  ptyOutputSchema,
  ptyResizeSchema,
  sessionCreateSchema,
  sessionCloseSchema,
  sessionLockSchema,
  sessionUnlockSchema,
  sessionWarningSchema,
  sessionExtendedSchema,
  sessionStatusSchema,
  commandNotifySchema,
  commandDispatchSchema,
  viewerJoinSchema,
  viewerLeaveSchema,
  viewerListRequestSchema,
  viewerListSchema,
  suggestionNotifySchema,
  suggestionAcceptedSchema,
  suggestionDismissedSchema,
  fileTransferSchema,
  heartbeatPingSchema,
  heartbeatPongSchema,
  errorMessageSchema,
};

// =============================================================================
// Inferred TypeScript Types
// =============================================================================

export type WsMessage = z.infer<typeof wsMessageSchema>;

export type PtyInputMessage = z.infer<typeof ptyInputSchema>;
export type PtyOutputMessage = z.infer<typeof ptyOutputSchema>;
export type PtyResizeMessage = z.infer<typeof ptyResizeSchema>;
export type SessionCreateMessage = z.infer<typeof sessionCreateSchema>;
export type SessionCloseMessage = z.infer<typeof sessionCloseSchema>;
export type SessionLockMessage = z.infer<typeof sessionLockSchema>;
export type SessionUnlockMessage = z.infer<typeof sessionUnlockSchema>;
export type SessionWarningMessage = z.infer<typeof sessionWarningSchema>;
export type SessionExtendedMessage = z.infer<typeof sessionExtendedSchema>;
export type SessionStatusMessage = z.infer<typeof sessionStatusSchema>;
export type CommandNotifyMessage = z.infer<typeof commandNotifySchema>;
export type CommandDispatchMessage = z.infer<typeof commandDispatchSchema>;
export type ViewerJoinMessage = z.infer<typeof viewerJoinSchema>;
export type ViewerLeaveMessage = z.infer<typeof viewerLeaveSchema>;
export type ViewerListRequestMessage = z.infer<typeof viewerListRequestSchema>;
export type ViewerListMessage = z.infer<typeof viewerListSchema>;
export type SuggestionNotifyMessage = z.infer<typeof suggestionNotifySchema>;
export type SuggestionAcceptedMessage = z.infer<
  typeof suggestionAcceptedSchema
>;
export type SuggestionDismissedMessage = z.infer<
  typeof suggestionDismissedSchema
>;
export type FileTransferMessage = z.infer<typeof fileTransferSchema>;
export type HeartbeatPingMessage = z.infer<typeof heartbeatPingSchema>;
export type HeartbeatPongMessage = z.infer<typeof heartbeatPongSchema>;
export type ErrorMessage = z.infer<typeof errorMessageSchema>;

export type WsMessageType = WsMessage['type'];
