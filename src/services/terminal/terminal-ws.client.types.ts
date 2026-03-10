import type { WsMessage } from '@services/terminal/ws-messages.schema';

export type WsMessageHandler<T extends WsMessage = WsMessage> = (
  message: T,
) => void;
