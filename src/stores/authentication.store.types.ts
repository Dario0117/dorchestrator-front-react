import type { useProfileQueryReturnType } from '@/services/users/get-profile.http-service';

export type Profile = NonNullable<useProfileQueryReturnType['data']>;

export interface AuthState {
  profile?: Profile;
}

export interface AuthActions {
  setProfile: (profile: Profile | undefined) => void;
}
