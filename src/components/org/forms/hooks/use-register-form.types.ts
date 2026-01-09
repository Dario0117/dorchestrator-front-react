import type { useRegisterMutationType } from '@services/users/register.http-service';

export interface UseRegisterFormProps {
  registerMutation: useRegisterMutationType;
  handleSuccess(data: useRegisterMutationType['data']): void;
}
