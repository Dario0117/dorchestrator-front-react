import { useAuthenticationStore } from '@stores/authentication.store';
import type { Profile } from '@stores/authentication.store.types';
import { act, renderHook } from '@testing-library/react';

describe('authentication.store', () => {
  beforeEach(() => {
    // Reset store state before each test
    useAuthenticationStore.setState({
      profile: undefined,
    });
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => useAuthenticationStore());

      expect(result.current.profile).toBeUndefined();
    });
  });

  describe('setUser action', () => {
    const mockUser: Profile = {
      id: 'test-user-id',
      createdAt: new Date(),
      updatedAt: new Date(),
      email: 'test@example.com',
      emailVerified: true,
      name: 'Test User',
      image: null,
    };

    it('should set user', () => {
      const { result } = renderHook(() => useAuthenticationStore());

      act(() => {
        result.current.setProfile(mockUser);
      });

      expect(result.current.profile).toEqual(mockUser);
    });

    it('should override existing user data', () => {
      const { result } = renderHook(() => useAuthenticationStore());

      const firstUser: Profile = {
        id: 'first-user-id',
        createdAt: new Date(),
        updatedAt: new Date(),
        email: 'first@example.com',
        emailVerified: true,
        name: 'First User',
        image: null,
      };

      const secondUser: Profile = {
        id: 'second-user-id',
        createdAt: new Date(),
        updatedAt: new Date(),
        email: 'second@example.com',
        emailVerified: true,
        name: 'Second User',
        image: null,
      };

      act(() => {
        result.current.setProfile(firstUser);
      });

      expect(result.current.profile).toEqual(firstUser);

      act(() => {
        result.current.setProfile(secondUser);
      });

      expect(result.current.profile).toEqual(secondUser);
    });
  });
});
