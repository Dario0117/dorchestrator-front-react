import type { useUpdatePasswordMutationType } from '@services/users/update-password.http-service';

export interface UpdatePasswordFormProps {
  updatePasswordMutation: useUpdatePasswordMutationType;
  handleSuccess(data: useUpdatePasswordMutationType['data']): void;
}
