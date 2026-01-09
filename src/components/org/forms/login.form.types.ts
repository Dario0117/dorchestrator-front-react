import type { useLoginMutationType } from '@/services/users/login.http-service';

export interface LoginFormProps {
  loginMutation: useLoginMutationType;
  handleSuccess(data: useLoginMutationType['data']): void;
}
