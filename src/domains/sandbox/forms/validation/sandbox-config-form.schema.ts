import { z } from 'zod/v4';

export const hostEntrySchema = z.object({
  id: z.string(),
  host: z.string().min(1, 'Host is required'),
  ports: z.string().optional(),
});

export const sandboxConfigFormSchema = z.object({
  name: z.string().min(1, 'Preset name is required'),
  description: z.string().optional(),
  requiresApproval: z.string(),
  sandboxTypeId: z.number().min(1, 'Please select a sandbox type'),
  networkMode: z.string().optional(),
  image: z.string().optional(),
  maxTimeoutMs: z.union([z.number().positive(), z.literal('')]).optional(),
  maxOutputSize: z.union([z.number().positive(), z.literal('')]).optional(),
  pidsLimit: z.union([z.number().positive(), z.literal('')]).optional(),
  allowExternal: z.array(hostEntrySchema).optional(),
  allowLocal: z.array(hostEntrySchema).optional(),
  denyExternal: z.array(hostEntrySchema).optional(),
  denyLocal: z.array(hostEntrySchema).optional(),
});

export type SandboxConfigFormData = z.infer<typeof sandboxConfigFormSchema>;
