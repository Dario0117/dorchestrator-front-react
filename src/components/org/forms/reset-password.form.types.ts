import type { useResetPasswordMutationType } from '@services/users/reset-password.http-service';

export interface ResetPasswordFormProps {
  resetPasswordMutation: useResetPasswordMutationType;
  handleSuccess(data: useResetPasswordMutationType['data']): void;
}
