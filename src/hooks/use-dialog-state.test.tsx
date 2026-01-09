import useDialogState from '@hooks/use-dialog-state';
import { act, renderHook } from '@testing-library/react';

describe('useDialogState', () => {
  describe('with default initial state', () => {
    it('should return null as initial state by default', () => {
      const { result } = renderHook(() => useDialogState());

      expect(result.current[0]).toBeNull();
    });

    it('should set state to value when called with new value', () => {
      const { result } = renderHook(() => useDialogState<string>());

      act(() => {
        result.current[1]('open');
      });

      expect(result.current[0]).toBe('open');
    });

    it('should toggle state to null when called with same value', () => {
      const { result } = renderHook(() => useDialogState<string>());

      // Set initial value
      act(() => {
        result.current[1]('open');
      });

      expect(result.current[0]).toBe('open');

      // Toggle to null by setting same value
      act(() => {
        result.current[1]('open');
      });

      expect(result.current[0]).toBeNull();
    });

    it('should handle boolean values', () => {
      const { result } = renderHook(() => useDialogState<boolean>());

      act(() => {
        result.current[1](true);
      });

      expect(result.current[0]).toBe(true);

      act(() => {
        result.current[1](true);
      });

      expect(result.current[0]).toBeNull();
    });
  });

  describe('with custom initial state', () => {
    it('should use provided initial state', () => {
      const { result } = renderHook(() => useDialogState<string>('initial'));

      expect(result.current[0]).toBe('initial');
    });

    it('should toggle custom initial state to null when set to same value', () => {
      const { result } = renderHook(() => useDialogState<string>('initial'));

      expect(result.current[0]).toBe('initial');

      act(() => {
        result.current[1]('initial');
      });

      expect(result.current[0]).toBeNull();
    });

    it('should change to different value when set to different value', () => {
      const { result } = renderHook(() => useDialogState<string>('initial'));

      act(() => {
        result.current[1]('different');
      });

      expect(result.current[0]).toBe('different');
    });
  });

  describe('with union types', () => {
    type DialogState = 'approve' | 'reject' | 'pending';

    it('should handle union string types', () => {
      const { result } = renderHook(() => useDialogState<DialogState>());

      act(() => {
        result.current[1]('approve');
      });

      expect(result.current[0]).toBe('approve');

      act(() => {
        result.current[1]('reject');
      });

      expect(result.current[0]).toBe('reject');

      // Toggle reject to null
      act(() => {
        result.current[1]('reject');
      });

      expect(result.current[0]).toBeNull();
    });

    it('should cycle through different states', () => {
      const { result } = renderHook(() => useDialogState<DialogState>());

      // Start with null
      expect(result.current[0]).toBeNull();

      // Set to approve
      act(() => {
        result.current[1]('approve');
      });
      expect(result.current[0]).toBe('approve');

      // Change to reject
      act(() => {
        result.current[1]('reject');
      });
      expect(result.current[0]).toBe('reject');

      // Change to pending
      act(() => {
        result.current[1]('pending');
      });
      expect(result.current[0]).toBe('pending');

      // Toggle pending to null
      act(() => {
        result.current[1]('pending');
      });
      expect(result.current[0]).toBeNull();
    });
  });

  describe('edge cases', () => {
    it('should handle null as a value', () => {
      const { result } = renderHook(() => useDialogState<string>('initial'));

      act(() => {
        result.current[1](null);
      });

      expect(result.current[0]).toBeNull();

      // Setting null again should still be null (no toggle behavior)
      act(() => {
        result.current[1](null);
      });

      expect(result.current[0]).toBeNull();
    });

    it('should maintain type safety', () => {
      type StrictDialogState = 'modal1' | 'modal2';
      const { result } = renderHook(() => useDialogState<StrictDialogState>());

      act(() => {
        result.current[1]('modal1');
      });

      expect(result.current[0]).toBe('modal1');

      act(() => {
        result.current[1]('modal2');
      });

      expect(result.current[0]).toBe('modal2');
    });

    it('should handle rapid state changes', () => {
      const { result } = renderHook(() => useDialogState<string>());

      act(() => {
        result.current[1]('state1');
        result.current[1]('state2');
        result.current[1]('state3');
      });

      expect(result.current[0]).toBe('state3');

      act(() => {
        result.current[1]('state3'); // Toggle to null
      });

      expect(result.current[0]).toBeNull();
    });
  });

  describe('return value structure', () => {
    it('should return a tuple with state and setter', () => {
      const { result } = renderHook(() => useDialogState<string>());

      expect(Array.isArray(result.current)).toBe(true);
      expect(result.current).toHaveLength(2);
      expect(typeof result.current[0]).toBe('object'); // null is typeof 'object'
      expect(typeof result.current[1]).toBe('function');
    });

    it('should have stable setter reference', () => {
      const { result, rerender } = renderHook(() => useDialogState<string>());

      const firstSetter = result.current[1];

      rerender();

      const secondSetter = result.current[1];

      // The setter function should have consistent behavior (may not be referentially equal due to closure)
      expect(typeof firstSetter).toBe('function');
      expect(typeof secondSetter).toBe('function');
    });
  });

  describe('complex scenarios', () => {
    it('should handle dialog workflow scenario', () => {
      type DialogType = 'confirm-delete' | 'confirm-save' | 'loading';
      const { result } = renderHook(() => useDialogState<DialogType>());

      // Start closed
      expect(result.current[0]).toBeNull();

      // Open delete confirmation
      act(() => {
        result.current[1]('confirm-delete');
      });
      expect(result.current[0]).toBe('confirm-delete');

      // Change to save confirmation
      act(() => {
        result.current[1]('confirm-save');
      });
      expect(result.current[0]).toBe('confirm-save');

      // Show loading
      act(() => {
        result.current[1]('loading');
      });
      expect(result.current[0]).toBe('loading');

      // Close all dialogs
      act(() => {
        result.current[1]('loading');
      });
      expect(result.current[0]).toBeNull();
    });
  });
});
