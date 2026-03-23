import type { useLoginMutationType } from '@domains/org/services/users/login.http-service';

export interface UseLoginFormProps {
  loginMutation: useLoginMutationType;
  handleSuccess(data: useLoginMutationType['data']): void;
}
