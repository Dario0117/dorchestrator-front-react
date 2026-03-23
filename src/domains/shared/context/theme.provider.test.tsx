import { useTheme } from '@domains/shared/context/theme.provider';
import { matchMediaMock, renderWithProviders } from '@lib/test-wrappers.utils';
import { act, render, screen } from '@testing-library/react';
import React from 'react';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Test component that uses the theme hook
function TestComponent() {
  const { theme, setTheme } = useTheme();

  return (
    <div>
      <span data-testid="current-theme">{theme}</span>
      <button
        type="button"
        data-testid="set-light"
        onClick={() => setTheme('light')}
      >
        Set Light
      </button>
      <button
        type="button"
        data-testid="set-dark"
        onClick={() => setTheme('dark')}
      >
        Set Dark
      </button>
      <button
        type="button"
        data-testid="set-system"
        onClick={() => setTheme('system')}
      >
        Set System
      </button>
    </div>
  );
}

describe('ThemeProvider', () => {
  const originalDocumentElement = document.documentElement;

  beforeEach(() => {
    // Reset mocks
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    matchMediaMock.mockClear();

    // Mock document.documentElement
    const mockElement = {
      classList: {
        add: vi.fn(),
        remove: vi.fn(),
      },
    };
    Object.defineProperty(document, 'documentElement', {
      value: mockElement,
      writable: true,
    });
  });

  afterEach(() => {
    // Restore original documentElement
    Object.defineProperty(document, 'documentElement', {
      value: originalDocumentElement,
      writable: true,
    });
  });

  it('renders children correctly', () => {
    renderWithProviders(<div data-testid="child">Test content</div>);

    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('uses default theme when no localStorage value exists', () => {
    localStorageMock.getItem.mockReturnValue(null);

    renderWithProviders(<TestComponent />, {
      defaultTheme: 'light',
    });

    expect(screen.getByTestId('current-theme')).toHaveTextContent('light');
  });

  it('uses theme from localStorage when available', () => {
    localStorageMock.getItem.mockReturnValue('dark');

    renderWithProviders(<TestComponent />);

    expect(screen.getByTestId('current-theme')).toHaveTextContent('dark');
  });

  it('applies light theme class to document element', () => {
    localStorageMock.getItem.mockReturnValue('light');

    renderWithProviders(<TestComponent />);

    expect(document.documentElement.classList.remove).toHaveBeenCalledWith(
      'light',
      'dark',
    );
    expect(document.documentElement.classList.add).toHaveBeenCalledWith(
      'light',
    );
  });

  it('applies dark theme class to document element', () => {
    localStorageMock.getItem.mockReturnValue('dark');

    renderWithProviders(<TestComponent />);

    expect(document.documentElement.classList.remove).toHaveBeenCalledWith(
      'light',
      'dark',
    );
    expect(document.documentElement.classList.add).toHaveBeenCalledWith('dark');
  });

  it('applies system theme based on media query preference (dark)', () => {
    localStorageMock.getItem.mockReturnValue('system');
    matchMediaMock.mockReturnValue({ matches: true });

    renderWithProviders(<TestComponent />);

    expect(document.documentElement.classList.remove).toHaveBeenCalledWith(
      'light',
      'dark',
    );
    expect(document.documentElement.classList.add).toHaveBeenCalledWith('dark');
  });

  it('applies system theme based on media query preference (light)', () => {
    localStorageMock.getItem.mockReturnValue('system');
    matchMediaMock.mockReturnValue({ matches: false });

    renderWithProviders(<TestComponent />);

    expect(document.documentElement.classList.remove).toHaveBeenCalledWith(
      'light',
      'dark',
    );
    expect(document.documentElement.classList.add).toHaveBeenCalledWith(
      'light',
    );
  });

  it('updates theme and saves to localStorage when setTheme is called', () => {
    localStorageMock.getItem.mockReturnValue('light');

    renderWithProviders(<TestComponent />, {
      storageKey: 'test-theme',
    });

    const setDarkButton = screen.getByTestId('set-dark');

    act(() => {
      setDarkButton.click();
    });

    expect(localStorageMock.setItem).toHaveBeenCalledWith('test-theme', 'dark');
    expect(screen.getByTestId('current-theme')).toHaveTextContent('dark');
  });

  it('uses custom storage key', () => {
    const customKey = 'my-custom-theme-key';
    localStorageMock.getItem.mockReturnValue('dark');

    renderWithProviders(<TestComponent />, {
      storageKey: customKey,
    });

    expect(localStorageMock.getItem).toHaveBeenCalledWith(customKey);
  });

  it('updates document classes when theme changes', () => {
    localStorageMock.getItem.mockReturnValue('light');

    renderWithProviders(<TestComponent />);

    const setDarkButton = screen.getByTestId('set-dark');

    act(() => {
      setDarkButton.click();
    });

    // Should be called twice: once on initial render, once on theme change
    expect(document.documentElement.classList.remove).toHaveBeenCalledTimes(2);
    expect(document.documentElement.classList.add).toHaveBeenCalledWith('dark');
  });
});

describe('useTheme', () => {
  it('returns theme context when used within ThemeProvider', () => {
    localStorageMock.getItem.mockReturnValue('light');

    renderWithProviders(<TestComponent />);

    expect(screen.getByTestId('current-theme')).toHaveTextContent('light');
  });

  it('throws error when used outside ThemeProvider', () => {
    // Component that tries to use useTheme outside provider
    function ComponentWithoutProvider() {
      useTheme();
      return <div>Should not render</div>;
    }

    // Error boundary to catch the error
    class ErrorBoundary extends React.Component<
      { children: React.ReactNode },
      { hasError: boolean; error: Error | null }
    > {
      constructor(props: { children: React.ReactNode }) {
        super(props);
        this.state = { hasError: false, error: null };
      }

      static getDerivedStateFromError(error: Error) {
        return { hasError: true, error };
      }

      render() {
        if (this.state.hasError) {
          return <div data-testid="error">{this.state.error?.message}</div>;
        }
        return this.props.children;
      }
    }

    // Suppress error logging for this test since we expect an error
    // biome-ignore lint/suspicious/noConsole: Need to suppress console.error for error boundary test
    const originalError = globalThis.console.error;
    globalThis.console.error = vi.fn();

    render(
      <ErrorBoundary>
        <ComponentWithoutProvider />
      </ErrorBoundary>,
    );

    expect(screen.getByTestId('error')).toHaveTextContent(
      'useTheme must be used within a ThemeProvider',
    );

    // Restore console.error
    globalThis.console.error = originalError;
  });
});
