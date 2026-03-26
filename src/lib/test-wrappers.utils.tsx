import { ThemeProvider } from '@domains/shared/context/theme.provider';
import type { ProviderWrapperOptions } from '@lib/test-wrappers.utils.types';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
export async function clickTrigger(element: HTMLElement) {
  await act(async () => {
    fireEvent.click(element);
    // Flush microtask queue so floating-ui position calculations complete within act()
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
}

/**
 * Select an option in a Base UI Select component by opening the trigger and clicking an option.
 * Handles the full open → select → close lifecycle within act() boundaries to prevent
 * act() warnings from Base UI's async floating-ui cleanup.
 */
export async function selectOption(trigger: HTMLElement, optionName: string) {
  await clickTrigger(trigger);
  const option = await screen.findByRole('option', { name: optionName });
  const user = userEvent.setup();
  await user.click(option);
  // Wait for Base UI's deferred select close/cleanup to complete within act()
  await waitFor(() => {
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
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
