import type { useChangePasswordMutationType } from '@domains/org/services/users/change-password.http-service';

export interface ChangePasswordFormProps {
  changePasswordMutation: useChangePasswordMutationType;
  handleSuccess(data: useChangePasswordMutationType['data']): void;
}
