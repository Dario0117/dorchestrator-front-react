import type { useRegisterMutationType } from '@domains/org/services/users/register.http-service';

export interface UseRegisterFormProps {
  registerMutation: useRegisterMutationType;
  handleSuccess(data: useRegisterMutationType['data']): void;
}
