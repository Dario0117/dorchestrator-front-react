import { Header } from '@components/layout/header';
import { SidebarProvider } from '@components/ui/sidebar';
import { renderWithProviders } from '@lib/test-wrappers.utils';
import { screen, waitFor } from '@testing-library/react';

function renderHeader(props = {}) {
  return renderWithProviders(
    <SidebarProvider>
      <Header {...props}>
        <div data-testid="header-content">Header Content</div>
      </Header>
    </SidebarProvider>,
  );
}

describe('Header', () => {
  it('should render header with children', () => {
    renderHeader();

    expect(screen.getByTestId('header-content')).toBeInTheDocument();
  });

  it('should render sidebar trigger button', () => {
    renderHeader();

    const trigger = screen.getByRole('button');
    expect(trigger).toBeInTheDocument();
  });

  it('should apply fixed class when fixed prop is true', () => {
    const { container } = renderHeader({ fixed: true });

    const header = container.querySelector('header');
    expect(header).toHaveClass(
      'header-fixed',
      'peer/header',
      'sticky',
      'top-0',
    );
  });

  it('should not apply fixed class when fixed prop is false', () => {
    const { container } = renderHeader({ fixed: false });

    const header = container.querySelector('header');
    expect(header).not.toHaveClass('header-fixed');
    expect(header).not.toHaveClass('peer/header');
  });

  it('should apply custom className', () => {
    const { container } = renderHeader({ className: 'custom-header' });

    const header = container.querySelector('header');
    expect(header).toHaveClass('custom-header');
  });

  it('should have correct height class', () => {
    const { container } = renderHeader();

    const header = container.querySelector('header');
    expect(header).toHaveClass('h-16');
  });

  it('should apply shadow-none class when not scrolled', () => {
    const { container } = renderHeader({ fixed: true });

    const header = container.querySelector('header');
    expect(header).toHaveClass('shadow-none');
  });

  it('should add scroll event listener when component mounts', () => {
    const addEventListenerSpy = vi.spyOn(document, 'addEventListener');

    renderHeader({ fixed: true });

    expect(addEventListenerSpy).toHaveBeenCalledWith(
      'scroll',
      expect.any(Function),
      { passive: true },
    );

    addEventListenerSpy.mockRestore();
  });

  it('should remove scroll event listener when component unmounts', () => {
    const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');

    const { unmount } = renderHeader({ fixed: true });
    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'scroll',
      expect.any(Function),
    );

    removeEventListenerSpy.mockRestore();
  });

  it('should pass through additional HTML attributes', () => {
    const { container } = renderHeader({ 'data-testid': 'test-header' });

    const header = container.querySelector('header');
    expect(header).toHaveAttribute('data-testid', 'test-header');
  });

  it('should render SidebarTrigger with correct variant', () => {
    renderHeader();

    const trigger = screen.getByRole('button');
    expect(trigger).toHaveClass('max-md:scale-125');
  });

  it('should apply shadow class when scrolled past 10px with fixed prop', async () => {
    const { container } = renderHeader({ fixed: true });

    const header = container.querySelector('header');
    expect(header).toHaveClass('shadow-none');

    // Simulate scrolling
    Object.defineProperty(document.documentElement, 'scrollTop', {
      writable: true,
      configurable: true,
      value: 15,
    });
    Object.defineProperty(document.body, 'scrollTop', {
      writable: true,
      configurable: true,
      value: 15,
    });

    // Trigger scroll event
    const scrollEvent = new Event('scroll');
    document.dispatchEvent(scrollEvent);

    await waitFor(() => {
      expect(header).toHaveClass('shadow');
    });
  });

  it('should apply backdrop blur styling when scrolled past 10px with fixed prop', async () => {
    const { container } = renderHeader({ fixed: true });

    const innerDiv = container.querySelector('header > div');
    expect(innerDiv).not.toHaveClass(
      'after:bg-background/20',
      'after:absolute',
      'after:inset-0',
      'after:-z-10',
      'after:backdrop-blur-lg',
    );

    // Simulate scrolling
    Object.defineProperty(document.documentElement, 'scrollTop', {
      writable: true,
      configurable: true,
      value: 20,
    });
    Object.defineProperty(document.body, 'scrollTop', {
      writable: true,
      configurable: true,
      value: 20,
    });

    // Trigger scroll event
    const scrollEvent = new Event('scroll');
    document.dispatchEvent(scrollEvent);

    await waitFor(() => {
      expect(innerDiv).toHaveClass(
        'after:bg-background/20',
        'after:absolute',
        'after:inset-0',
        'after:-z-10',
        'after:backdrop-blur-lg',
      );
    });
  });

  it('should not apply shadow when scrolled without fixed prop', () => {
    const { container } = renderHeader({ fixed: false });

    const header = container.querySelector('header');

    // Simulate scrolling
    Object.defineProperty(document.documentElement, 'scrollTop', {
      writable: true,
      configurable: true,
      value: 15,
    });
    Object.defineProperty(document.body, 'scrollTop', {
      writable: true,
      configurable: true,
      value: 15,
    });

    // Trigger scroll event
    const scrollEvent = new Event('scroll');
    document.dispatchEvent(scrollEvent);

    expect(header).not.toHaveClass('shadow');
  });
});
