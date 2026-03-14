import type { useChangePasswordMutationType } from '@services/users/change-password.http-service';

export interface UseChangePasswordFormProps {
  changePasswordMutation: useChangePasswordMutationType;
  handleSuccess(data: useChangePasswordMutationType['data']): void;
}
