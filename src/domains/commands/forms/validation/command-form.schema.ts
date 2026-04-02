import { z } from 'zod/v4';
import type {
  ApiRequestBody,
  Expect,
  IsExact,
} from '@/types/form-api-sync.types';

export const commandFormSchema = z.object({
  deviceId: z.number().min(1, 'Please select a device'),
  command: z
    .string()
    .min(1, 'Command cannot be empty')
    .max(10000, 'Command exceeds maximum length (10,000 characters)'),
  sandboxPresetId: z.number().min(0, 'Sandbox preset is required'),
  shell: z.string().min(1, 'Please select a shell'),
});

export type CommandFormData = z.infer<typeof commandFormSchema>;

// Compile-time check: if the API contract changes, this will error with
// "Type 'false' does not satisfy the constraint 'true'"
export type FormApiSync = Expect<
  IsExact<
    CommandFormData,
    ApiRequestBody<'postApiV1ByOrganizationIdTeamsByTeamIdCommands'>
  >
>;
