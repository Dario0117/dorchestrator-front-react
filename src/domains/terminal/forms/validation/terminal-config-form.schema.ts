import { z } from 'zod/v4';

const MINUTES_IN_3_DAYS = 3 * 24 * 60;
const HOURS_IN_3_DAYS = 3 * 24;

export const terminalConfigFormSchema = z
  .object({
    inactivityTimeoutMinutes: z
      .union([z.number(), z.string()])
      .transform(Number)
      .pipe(
        z
          .number({ error: 'Inactivity timeout is required' })
          .int({ error: 'Must be a whole number' })
          .min(1, { error: 'Must be at least 1 minute' })
          .max(MINUTES_IN_3_DAYS, {
            error: `Cannot exceed ${MINUTES_IN_3_DAYS} minutes (3 days)`,
          }),
      ),
    hardCapHours: z
      .union([
        z.literal(''),
        z
          .union([z.number(), z.string()])
          .transform(Number)
          .pipe(
            z
              .number()
              .int({ error: 'Must be a whole number' })
              .min(1, { error: 'Must be at least 1 hour' })
              .max(HOURS_IN_3_DAYS, {
                error: `Cannot exceed ${HOURS_IN_3_DAYS} hours (3 days)`,
              }),
          ),
      ])
      .transform((val) => (val === '' ? null : val)),
  })
  .refine(
    (data) => {
      if (data.hardCapHours === null) {
        return true;
      }
      const inactivityMs = data.inactivityTimeoutMinutes * 60 * 1000;
      const hardCapMs = data.hardCapHours * 60 * 60 * 1000;
      return inactivityMs <= hardCapMs;
    },
    {
      error: 'Inactivity timeout cannot exceed the hard cap',
      path: ['hardCapHours'],
    },
  );
