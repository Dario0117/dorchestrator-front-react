// Zod schemas in validation/ folders are normally not tested (see docs/testing.md).
// Exception: this schema has a custom .refine() callback that validates password confirmation matching.

import { changePasswordFormSchema } from '@/domains/org/forms/validation/change-password-form.schema';

describe('changePasswordFormSchema', () => {
  describe('refine - password confirmation', () => {
    it('passes when newPassword and confirm match', () => {
      const result = changePasswordFormSchema.safeParse({
        currentPassword: 'oldpass',
        newPassword: 'newpass123',
        confirm: 'newpass123',
      });

      expect(result.success).toBe(true);
    });

    it('fails when newPassword and confirm do not match', () => {
      const result = changePasswordFormSchema.safeParse({
        currentPassword: 'oldpass',
        newPassword: 'newpass123',
        confirm: 'different',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        const confirmError = result.error.issues.find((issue) =>
          issue.path.includes('confirm'),
        );
        expect(confirmError?.message).toBe("Passwords don't match");
      }
    });
  });
});
