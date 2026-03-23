import { z } from 'zod/v4';

export const terminalReauthFormSchema = z.object({
  password: z.string().min(1, 'Password is required'),
});

export type TerminalReauthFormData = z.infer<typeof terminalReauthFormSchema>;
