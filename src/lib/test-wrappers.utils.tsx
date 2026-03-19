import { ThemeProvider } from '@context/theme.provider';
import type { ProviderWrapperOptions } from '@lib/test-wrappers.utils.types';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, fireEvent, render } from '@testing-library/react';
import type { ReactNode } from 'react';

// Mock matchMedia
export const matchMediaMock = vi.fn().mockImplementation((query) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
}));

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: matchMediaMock,
});

// Mock ResizeObserver as a proper class (required for Vitest 4)
global.ResizeObserver = class ResizeObserver {
  observe() {
    // noop
  }
  /* v8 ignore next 3 -- jsdom polyfill stub, never called in tests */
  unobserve() {
    // noop
  }
  disconnect() {
    // noop
  }
};

export const createQueryThemeWrapper = (options?: ProviderWrapperOptions) => {
  const { storageKey = 'core-ui-theme', defaultTheme = 'system' } =
    options || {};
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: ReactNode }) => (
    <ThemeProvider
      defaultTheme={defaultTheme}
      storageKey={storageKey}
    >
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </ThemeProvider>
  );
};

/**
 * Click a trigger element that opens a Base UI floating element (dropdown, dialog, etc).
 * Uses fireEvent.click instead of userEvent.click because Base UI's floating-ui
 * dismiss handler conflicts with userEvent's full pointer event sequence in jsdom.
 */
export function clickTrigger(element: HTMLElement) {
  return act(() => {
    fireEvent.click(element);
  });
}

export function renderWithProviders(
  ui: React.ReactElement,
  options?: ProviderWrapperOptions,
) {
  return render(ui, {
    wrapper: createQueryThemeWrapper(options),
  });
}
