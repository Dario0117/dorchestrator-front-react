import { SearchProvider, useSearch } from '@context/search.provider';
import { fireEvent, render, screen } from '@testing-library/react';

// Mock the CommandMenu component
vi.mock('@/components/command-menu', () => ({
  CommandMenu: () => <div data-testid="command-menu">Command Menu</div>,
}));

// Test component that uses the search hook
function TestComponent() {
  const { open, setOpen } = useSearch();

  return (
    <div>
      <span data-testid="search-open">{open.toString()}</span>
      <button
        type="button"
        data-testid="open-search"
        onClick={() => setOpen(true)}
      >
        Open Search
      </button>
      <button
        type="button"
        data-testid="close-search"
        onClick={() => setOpen(false)}
      >
        Close Search
      </button>
      <button
        type="button"
        data-testid="toggle-search"
        onClick={() => setOpen((prev) => !prev)}
      >
        Toggle Search
      </button>
    </div>
  );
}

describe('SearchProvider', () => {
  // biome-ignore lint/suspicious/noExplicitAny: tests
  let addEventListener: any;
  // biome-ignore lint/suspicious/noExplicitAny: tests
  let removeEventListener: any;

  beforeEach(() => {
    // Mock document event listeners
    addEventListener = vi.spyOn(document, 'addEventListener');
    removeEventListener = vi.spyOn(document, 'removeEventListener');
  });

  afterEach(() => {
    // Restore mocks
    addEventListener.mockRestore();
    removeEventListener.mockRestore();
  });

  it('renders children and CommandMenu', () => {
    render(
      <SearchProvider>
        <div data-testid="child">Test content</div>
      </SearchProvider>,
    );

    expect(screen.getByTestId('child')).toBeInTheDocument();
    expect(screen.getByTestId('command-menu')).toBeInTheDocument();
  });

  it('initializes with search closed', () => {
    render(
      <SearchProvider>
        <TestComponent />
      </SearchProvider>,
    );

    expect(screen.getByTestId('search-open')).toHaveTextContent('false');
  });

  it('allows opening and closing search', () => {
    render(
      <SearchProvider>
        <TestComponent />
      </SearchProvider>,
    );

    expect(screen.getByTestId('search-open')).toHaveTextContent('false');

    // Open search
    fireEvent.click(screen.getByTestId('open-search'));
    expect(screen.getByTestId('search-open')).toHaveTextContent('true');

    // Close search
    fireEvent.click(screen.getByTestId('close-search'));
    expect(screen.getByTestId('search-open')).toHaveTextContent('false');
  });

  it('allows toggling search state', () => {
    render(
      <SearchProvider>
        <TestComponent />
      </SearchProvider>,
    );

    expect(screen.getByTestId('search-open')).toHaveTextContent('false');

    // Toggle to open
    fireEvent.click(screen.getByTestId('toggle-search'));
    expect(screen.getByTestId('search-open')).toHaveTextContent('true');

    // Toggle to close
    fireEvent.click(screen.getByTestId('toggle-search'));
    expect(screen.getByTestId('search-open')).toHaveTextContent('false');
  });

  it('sets up keyboard event listener on mount', () => {
    render(
      <SearchProvider>
        <TestComponent />
      </SearchProvider>,
    );

    expect(addEventListener).toHaveBeenCalledWith(
      'keydown',
      expect.any(Function),
    );
  });

  it('removes keyboard event listener on unmount', () => {
    const { unmount } = render(
      <SearchProvider>
        <TestComponent />
      </SearchProvider>,
    );

    unmount();

    expect(removeEventListener).toHaveBeenCalledWith(
      'keydown',
      expect.any(Function),
    );
  });

  it('toggles search when Cmd+K is pressed', () => {
    render(
      <SearchProvider>
        <TestComponent />
      </SearchProvider>,
    );

    expect(screen.getByTestId('search-open')).toHaveTextContent('false');

    // Simulate Cmd+K
    fireEvent.keyDown(document, {
      key: 'k',
      metaKey: true,
    });

    expect(screen.getByTestId('search-open')).toHaveTextContent('true');

    // Simulate Cmd+K again
    fireEvent.keyDown(document, {
      key: 'k',
      metaKey: true,
    });

    expect(screen.getByTestId('search-open')).toHaveTextContent('false');
  });

  it('toggles search when Ctrl+K is pressed', () => {
    render(
      <SearchProvider>
        <TestComponent />
      </SearchProvider>,
    );

    expect(screen.getByTestId('search-open')).toHaveTextContent('false');

    // Simulate Ctrl+K
    fireEvent.keyDown(document, {
      key: 'k',
      ctrlKey: true,
    });

    expect(screen.getByTestId('search-open')).toHaveTextContent('true');
  });

  it('does not toggle search for other key combinations', () => {
    render(
      <SearchProvider>
        <TestComponent />
      </SearchProvider>,
    );

    expect(screen.getByTestId('search-open')).toHaveTextContent('false');

    // Simulate other key combinations
    fireEvent.keyDown(document, {
      key: 'j',
      metaKey: true,
    });

    fireEvent.keyDown(document, {
      key: 'k',
      shiftKey: true,
    });

    fireEvent.keyDown(document, {
      key: 'k',
    });

    expect(screen.getByTestId('search-open')).toHaveTextContent('false');
  });

  it('prevents default behavior when Cmd+K or Ctrl+K is pressed', () => {
    const mockPreventDefault = vi.fn();

    // Mock addEventListener to capture the actual handler
    let keydownHandler: ((event: KeyboardEvent) => void) | undefined;
    const originalAddEventListener = document.addEventListener;
    document.addEventListener = vi.fn((type, handler) => {
      if (type === 'keydown') {
        keydownHandler = handler as (event: KeyboardEvent) => void;
      }
      return originalAddEventListener.call(document, type, handler);
    });

    render(
      <SearchProvider>
        <TestComponent />
      </SearchProvider>,
    );

    // Create a mock event object
    const mockEvent = {
      key: 'k',
      metaKey: true,
      preventDefault: mockPreventDefault,
    } as unknown as KeyboardEvent;

    // Call the handler directly with our mock event
    if (keydownHandler) {
      keydownHandler(mockEvent);
    }

    expect(mockPreventDefault).toHaveBeenCalled();

    // Restore addEventListener
    document.addEventListener = originalAddEventListener;
  });

  it('provides correct context value', () => {
    render(
      <SearchProvider>
        <TestComponent />
      </SearchProvider>,
    );

    // Test that the context provides both open state and setOpen function
    expect(screen.getByTestId('search-open')).toBeInTheDocument();
    expect(screen.getByTestId('open-search')).toBeInTheDocument();
    expect(screen.getByTestId('close-search')).toBeInTheDocument();
  });
});

describe('useSearch', () => {
  it('throws error when used outside SearchProvider', () => {
    expect(() => {
      render(<TestComponent />);
    }).toThrow('useSearch has to be used within SearchProvider');
  });

  it('returns search context when used within SearchProvider', () => {
    render(
      <SearchProvider>
        <TestComponent />
      </SearchProvider>,
    );

    expect(screen.getByTestId('search-open')).toHaveTextContent('false');
  });
});
