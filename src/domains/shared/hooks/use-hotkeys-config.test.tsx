import { useHotkeysConfig } from '@domains/shared/hooks/use-hotkeys-config';
import { fireEvent, renderHook } from '@testing-library/react';

describe('useHotkeysConfig', () => {
  it('calls onCommandPalette on Mod+K', () => {
    const actions = {
      onCommandPalette: vi.fn(),
    };
    renderHook(() => useHotkeysConfig(actions));

    fireEvent.keyDown(document, { key: 'k', ctrlKey: true });

    expect(actions.onCommandPalette).toHaveBeenCalledOnce();
  });

  it('calls onFilter on F key', () => {
    const actions = {
      onCommandPalette: vi.fn(),
      onFilter: vi.fn(),
    };
    renderHook(() => useHotkeysConfig(actions));

    fireEvent.keyDown(document, { key: 'f' });

    expect(actions.onFilter).toHaveBeenCalledOnce();
  });

  it('calls onNew on N key', () => {
    const actions = {
      onCommandPalette: vi.fn(),
      onNew: vi.fn(),
    };
    renderHook(() => useHotkeysConfig(actions));

    fireEvent.keyDown(document, { key: 'n' });

    expect(actions.onNew).toHaveBeenCalledOnce();
  });

  it('calls onSearch on / key', () => {
    const actions = {
      onCommandPalette: vi.fn(),
      onSearch: vi.fn(),
    };
    renderHook(() => useHotkeysConfig(actions));

    fireEvent.keyDown(document, { key: '/' });

    expect(actions.onSearch).toHaveBeenCalledOnce();
  });

  it('calls onEscape on Escape key', () => {
    const actions = {
      onCommandPalette: vi.fn(),
      onEscape: vi.fn(),
    };
    renderHook(() => useHotkeysConfig(actions));

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(actions.onEscape).toHaveBeenCalledOnce();
  });
});
