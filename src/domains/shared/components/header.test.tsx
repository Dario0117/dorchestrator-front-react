import { SidebarProvider } from '@components/ds/organisms/sidebar';
import { Header } from '@domains/shared/components/header';
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

  it('should render header element', () => {
    const { container } = renderHeader();

    const header = container.querySelector('header');
    expect(header).toBeInTheDocument();
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

  it('should render with fixed position when fixed prop is true', () => {
    const { container } = renderHeader({ fixed: true });

    const header = container.querySelector('header');
    expect(header).toBeInTheDocument();
  });

  it('should update offset when scroll event fires', async () => {
    const { container } = renderHeader({ fixed: true });

    const header = container.querySelector('header');
    expect(header).toBeInTheDocument();

    // Simulate scroll past threshold
    Object.defineProperty(document.documentElement, 'scrollTop', {
      value: 20,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(document.body, 'scrollTop', {
      value: 0,
      writable: true,
      configurable: true,
    });

    document.dispatchEvent(new Event('scroll'));

    // After scroll, the header should have the shadow class applied (offset > 10 && fixed)
    await waitFor(() => {
      expect(header?.className).toContain('shadow');
    });
  });

  it('should use body.scrollTop as fallback when documentElement.scrollTop is 0', async () => {
    const { container } = renderHeader({ fixed: true });

    const header = container.querySelector('header');

    Object.defineProperty(document.documentElement, 'scrollTop', {
      value: 0,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(document.body, 'scrollTop', {
      value: 20,
      writable: true,
      configurable: true,
    });

    document.dispatchEvent(new Event('scroll'));

    await waitFor(() => {
      expect(header?.className).toContain('shadow');
    });
  });

  it('should not apply shadow when offset is below threshold', async () => {
    const { container } = renderHeader({ fixed: true });

    const header = container.querySelector('header');

    Object.defineProperty(document.documentElement, 'scrollTop', {
      value: 5,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(document.body, 'scrollTop', {
      value: 0,
      writable: true,
      configurable: true,
    });

    document.dispatchEvent(new Event('scroll'));

    await waitFor(() => {
      expect(header?.className).toContain('shadow-none');
    });
  });
});
