import type { useChangePasswordMutationType } from '@services/users/change-password.http-service';

export interface ChangePasswordFormProps {
  changePasswordMutation: useChangePasswordMutationType;
  handleSuccess(data: useChangePasswordMutationType['data']): void;
}
