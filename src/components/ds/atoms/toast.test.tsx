import { showToast } from '@components/ds/atoms/toast';
import { Toaster } from '@components/ds/atoms/toaster';
import { renderWithProviders } from '@lib/test-wrappers.utils';
import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

function renderToaster() {
  return renderWithProviders(<Toaster />);
}

describe('showToast', () => {
  it('renders a success toast with the given message', async () => {
    renderToaster();

    act(() => {
      showToast.success('Operation completed');
    });

    expect(await screen.findByText('Operation completed')).toBeInTheDocument();
  });

  it('renders an error toast with the given message', async () => {
    renderToaster();

    act(() => {
      showToast.error('Something went wrong');
    });

    expect(await screen.findByText('Something went wrong')).toBeInTheDocument();
  });

  it('renders an error toast with a retry action', async () => {
    const retrySpy = vi.fn();
    const user = userEvent.setup();
    renderToaster();

    act(() => {
      showToast.error('Upload failed', { retry: retrySpy });
    });

    const retryButton = await screen.findByRole('button', { name: 'Retry' });
    await user.click(retryButton);

    expect(retrySpy).toHaveBeenCalledOnce();
  });

  it('renders an info toast with the given message', async () => {
    renderToaster();

    act(() => {
      showToast.info('New update available');
    });

    expect(await screen.findByText('New update available')).toBeInTheDocument();
  });
});
