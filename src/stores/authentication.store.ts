import type {
  AuthActions,
  AuthState,
} from '@stores/authentication.store.types';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

export const useAuthenticationStore = create<AuthState & AuthActions>()(
  immer((set) => ({
    profile: undefined,
    setProfile: (profile) => {
      set((state) => {
        state.profile = profile;
      });
    },
  })),
);
