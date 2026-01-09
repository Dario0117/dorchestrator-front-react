import type { useLoginMutationType } from '@services/users/login.http-service';

export interface UseLoginFormProps {
  loginMutation: useLoginMutationType;
  handleSuccess(data: useLoginMutationType['data']): void;
}
