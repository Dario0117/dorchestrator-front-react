import type { useResetPasswordMutationType } from '@/services/users/reset-password.http-service';

export interface UseResetPasswordFormProps {
  resetPasswordMutation: useResetPasswordMutationType;
  handleSuccess(data: useResetPasswordMutationType['data']): void;
}
