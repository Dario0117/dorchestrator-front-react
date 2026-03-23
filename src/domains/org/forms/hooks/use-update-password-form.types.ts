import type { useUpdatePasswordMutationType } from '@domains/org/services/users/update-password.http-service';

export interface UseUpdatePasswordFormProps {
  updatePasswordMutation: useUpdatePasswordMutationType;
  handleSuccess(data: useUpdatePasswordMutationType['data']): void;
}
