import { z } from 'zod/v4';

export const registerFormBaseSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirm: z.string().min(1, 'Please confirm your password'),
  email: z.string().email('Invalid email address'),
});

export const registerFormSchema = registerFormBaseSchema.refine(
  (data) => data.password === data.confirm,
  {
    message: "Passwords don't match",
    path: ['confirm'],
  },
);

export type RegisterFormData = z.infer<typeof registerFormSchema>;
