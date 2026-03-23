import { z } from 'zod/v4';

export const resetPasswordFormSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export type ResetPasswordFormData = z.infer<typeof resetPasswordFormSchema>;
