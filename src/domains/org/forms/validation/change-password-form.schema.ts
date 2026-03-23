import { z } from 'zod/v4';

export const changePasswordFormBaseSchema = z.object({
  currentPassword: z.string().trim().min(1, 'Current password is required'),
  newPassword: z.string().trim().min(1, 'New password is required'),
  confirm: z.string().min(1, 'Please confirm your new password'),
});

export const changePasswordFormSchema = changePasswordFormBaseSchema.refine(
  (data) => data.newPassword === data.confirm,
  {
    message: "Passwords don't match",
    path: ['confirm'],
  },
);

export type ChangePasswordFormData = z.infer<typeof changePasswordFormSchema>;
