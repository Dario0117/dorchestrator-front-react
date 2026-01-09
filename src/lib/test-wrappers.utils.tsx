import { ThemeProvider } from '@context/theme.provider';
import type { ProviderWrapperOptions } from '@lib/test-wrappers.utils.types';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
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

global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

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

export function renderWithProviders(
  ui: React.ReactElement,
  options?: ProviderWrapperOptions,
) {
  return render(ui, {
    wrapper: createQueryThemeWrapper(options),
  });
}
