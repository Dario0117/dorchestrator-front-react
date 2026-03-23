import { z } from 'zod/v4';

export const commandFormSchema = z.object({
  deviceId: z.number().min(1, 'Please select a device'),
  command: z
    .string()
    .min(1, 'Command cannot be empty')
    .max(10000, 'Command exceeds maximum length (10,000 characters)'),
});

export type CommandFormData = z.infer<typeof commandFormSchema>;
