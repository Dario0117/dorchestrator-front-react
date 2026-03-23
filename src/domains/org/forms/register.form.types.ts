import type { useRegisterMutationType } from '@domains/org/services/users/register.http-service';

export interface RegisterFormProps {
  registerMutation: useRegisterMutationType;
  handleSuccess(data: useRegisterMutationType['data']): void;
}
