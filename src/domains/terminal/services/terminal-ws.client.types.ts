import type { WsMessage } from '@domains/terminal/services/ws-messages.schema';

export type WsMessageHandler<T extends WsMessage = WsMessage> = (
  message: T,
) => void;
