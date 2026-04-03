import { z } from 'zod/v4';

const updatePasswordFormBaseSchema = z.object({
  password: z.string().trim().min(1, 'Password is required'),
  confirm: z.string().min(1, 'Please confirm your password'),
});

export const updatePasswordFormSchema = updatePasswordFormBaseSchema.refine(
  (data) => data.password === data.confirm,
  {
    message: "Password don't match",
    path: ['confirm'],
  },
);

export type UpdatePasswordFormData = z.infer<typeof updatePasswordFormSchema>;
