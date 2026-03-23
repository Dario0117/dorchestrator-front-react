import type { useResetPasswordMutationType } from '@domains/org/services/users/reset-password.http-service';

export interface ResetPasswordFormProps {
  resetPasswordMutation: useResetPasswordMutationType;
  handleSuccess(data: useResetPasswordMutationType['data']): void;
}
