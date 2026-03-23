import {
  LayoutProvider,
  useLayout,
} from '@domains/shared/context/layout.provider';
import type {
  Collapsible,
  Variant,
} from '@domains/shared/context/layout.provider.types';
import * as cookiesModule from '@lib/cookies.utils';
import { act, render, screen } from '@testing-library/react';

// Mock the cookies module
vi.mock('@/lib/cookies.utils', () => ({
  getCookie: vi.fn(),
  setCookie: vi.fn(),
}));

const mockGetCookie = cookiesModule.getCookie as ReturnType<typeof vi.fn>;
const mockSetCookie = cookiesModule.setCookie as ReturnType<typeof vi.fn>;

// Test component that uses the layout hook
function TestComponent() {
  const {
    resetLayout,
    defaultCollapsible,
    collapsible,
    setCollapsible,
    defaultVariant,
    variant,
    setVariant,
  } = useLayout();

  return (
    <div>
      <span data-testid="default-collapsible">{defaultCollapsible}</span>
      <span data-testid="current-collapsible">{collapsible}</span>
      <span data-testid="default-variant">{defaultVariant}</span>
      <span data-testid="current-variant">{variant}</span>

      <button
        type="button"
        data-testid="set-collapsible-offcanvas"
        onClick={() => setCollapsible('offcanvas')}
      >
        Set Offcanvas
      </button>
      <button
        type="button"
        data-testid="set-collapsible-icon"
        onClick={() => setCollapsible('icon')}
      >
        Set Icon
      </button>
      <button
        type="button"
        data-testid="set-collapsible-none"
        onClick={() => setCollapsible('none')}
      >
        Set None
      </button>

      <button
        type="button"
        data-testid="set-variant-inset"
        onClick={() => setVariant('inset')}
      >
        Set Inset
      </button>
      <button
        type="button"
        data-testid="set-variant-sidebar"
        onClick={() => setVariant('sidebar')}
      >
        Set Sidebar
      </button>
      <button
        type="button"
        data-testid="set-variant-floating"
        onClick={() => setVariant('floating')}
      >
        Set Floating
      </button>

      <button
        type="button"
        data-testid="reset-layout"
        onClick={resetLayout}
      >
        Reset Layout
      </button>
    </div>
  );
}

describe('LayoutProvider', () => {
  beforeEach(() => {
    // Reset all mocks
    mockGetCookie.mockClear();
    mockSetCookie.mockClear();
  });

  it('renders children correctly', () => {
    mockGetCookie.mockReturnValue(undefined);

    render(
      <LayoutProvider>
        <div data-testid="child">Test content</div>
      </LayoutProvider>,
    );

    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('uses default values when no cookies exist', () => {
    mockGetCookie.mockReturnValue(undefined);

    render(
      <LayoutProvider>
        <TestComponent />
      </LayoutProvider>,
    );

    expect(screen.getByTestId('default-collapsible')).toHaveTextContent('icon');
    expect(screen.getByTestId('current-collapsible')).toHaveTextContent('icon');
    expect(screen.getByTestId('default-variant')).toHaveTextContent('sidebar');
    expect(screen.getByTestId('current-variant')).toHaveTextContent('sidebar');
  });

  it('uses values from cookies when available', () => {
    mockGetCookie
      .mockReturnValueOnce('offcanvas' as Collapsible)
      .mockReturnValueOnce('floating' as Variant);

    render(
      <LayoutProvider>
        <TestComponent />
      </LayoutProvider>,
    );

    expect(screen.getByTestId('current-collapsible')).toHaveTextContent(
      'offcanvas',
    );
    expect(screen.getByTestId('current-variant')).toHaveTextContent('floating');
  });

  it('updates collapsible state and saves to cookie', () => {
    mockGetCookie.mockReturnValue(undefined);

    render(
      <LayoutProvider>
        <TestComponent />
      </LayoutProvider>,
    );

    const setOffcanvasButton = screen.getByTestId('set-collapsible-offcanvas');

    act(() => {
      setOffcanvasButton.click();
    });

    expect(screen.getByTestId('current-collapsible')).toHaveTextContent(
      'offcanvas',
    );
    expect(mockSetCookie).toHaveBeenCalledWith(
      'layout_collapsible',
      'offcanvas',
      60 * 60 * 24 * 7,
    );
  });

  it('updates variant state and saves to cookie', () => {
    mockGetCookie.mockReturnValue(undefined);

    render(
      <LayoutProvider>
        <TestComponent />
      </LayoutProvider>,
    );

    const setInsetButton = screen.getByTestId('set-variant-inset');

    act(() => {
      setInsetButton.click();
    });

    expect(screen.getByTestId('current-variant')).toHaveTextContent('inset');
    expect(mockSetCookie).toHaveBeenCalledWith(
      'layout_variant',
      'inset',
      60 * 60 * 24 * 7,
    );
  });

  it('resets layout to default values', () => {
    mockGetCookie
      .mockReturnValueOnce('offcanvas')
      .mockReturnValueOnce('floating');

    render(
      <LayoutProvider>
        <TestComponent />
      </LayoutProvider>,
    );

    // Verify initial state from cookies
    expect(screen.getByTestId('current-collapsible')).toHaveTextContent(
      'offcanvas',
    );
    expect(screen.getByTestId('current-variant')).toHaveTextContent('floating');

    const resetButton = screen.getByTestId('reset-layout');

    act(() => {
      resetButton.click();
    });

    // Verify reset to defaults
    expect(screen.getByTestId('current-collapsible')).toHaveTextContent('icon');
    expect(screen.getByTestId('current-variant')).toHaveTextContent('sidebar');

    // Verify cookies were set to defaults
    expect(mockSetCookie).toHaveBeenCalledWith(
      'layout_collapsible',
      'icon',
      60 * 60 * 24 * 7,
    );
    expect(mockSetCookie).toHaveBeenCalledWith(
      'layout_variant',
      'sidebar',
      60 * 60 * 24 * 7,
    );
  });

  it('supports all collapsible options', () => {
    mockGetCookie.mockReturnValue(undefined);

    render(
      <LayoutProvider>
        <TestComponent />
      </LayoutProvider>,
    );

    // Test offcanvas
    act(() => {
      screen.getByTestId('set-collapsible-offcanvas').click();
    });
    expect(screen.getByTestId('current-collapsible')).toHaveTextContent(
      'offcanvas',
    );

    // Test icon
    act(() => {
      screen.getByTestId('set-collapsible-icon').click();
    });
    expect(screen.getByTestId('current-collapsible')).toHaveTextContent('icon');

    // Test none
    act(() => {
      screen.getByTestId('set-collapsible-none').click();
    });
    expect(screen.getByTestId('current-collapsible')).toHaveTextContent('none');
  });

  it('supports all variant options', () => {
    mockGetCookie.mockReturnValue(undefined);

    render(
      <LayoutProvider>
        <TestComponent />
      </LayoutProvider>,
    );

    // Test inset
    act(() => {
      screen.getByTestId('set-variant-inset').click();
    });
    expect(screen.getByTestId('current-variant')).toHaveTextContent('inset');

    // Test sidebar
    act(() => {
      screen.getByTestId('set-variant-sidebar').click();
    });
    expect(screen.getByTestId('current-variant')).toHaveTextContent('sidebar');

    // Test floating
    act(() => {
      screen.getByTestId('set-variant-floating').click();
    });
    expect(screen.getByTestId('current-variant')).toHaveTextContent('floating');
  });

  it('calls getCookie with correct parameters during initialization', () => {
    mockGetCookie.mockReturnValue(undefined);

    render(
      <LayoutProvider>
        <TestComponent />
      </LayoutProvider>,
    );

    expect(mockGetCookie).toHaveBeenCalledWith('layout_collapsible');
    expect(mockGetCookie).toHaveBeenCalledWith('layout_variant');
  });
});

describe('useLayout', () => {
  it('throws error when used outside LayoutProvider', () => {
    expect(() => {
      render(<TestComponent />);
    }).toThrow('useLayout must be used within a LayoutProvider');
  });

  it('returns layout context when used within LayoutProvider', () => {
    mockGetCookie.mockReturnValue(undefined);

    render(
      <LayoutProvider>
        <TestComponent />
      </LayoutProvider>,
    );

    expect(screen.getByTestId('default-collapsible')).toHaveTextContent('icon');
    expect(screen.getByTestId('default-variant')).toHaveTextContent('sidebar');
  });
});
