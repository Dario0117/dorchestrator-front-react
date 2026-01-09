import type { useRegisterMutationType } from '@/services/users/register.http-service';

export interface RegisterFormProps {
  registerMutation: useRegisterMutationType;
  handleSuccess(data: useRegisterMutationType['data']): void;
}
