import { useLogoutMutation } from '@domains/org/services/users/logout.http-service';
import { createQueryThemeWrapper } from '@lib/test-wrappers.utils';
import { renderHook, waitFor } from '@testing-library/react';

describe('useLogoutMutation', () => {
  it('should call handleSuccess callback when mutation succeeds', async () => {
    const handleSuccess = vi.fn();
    const { result } = renderHook(() => useLogoutMutation({ handleSuccess }), {
      wrapper: createQueryThemeWrapper(),
    });
    result.current.mutate();

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(handleSuccess).toHaveBeenCalled();
  });
});
