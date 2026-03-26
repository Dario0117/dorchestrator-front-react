// Toaster is a configuration pass-through to Sonner's SonnerToaster
// with static props (position, richColors, closeButton). The toast
// rendering behavior is already tested in toast.test.tsx.

import { Toaster } from '@components/ds/atoms/toaster';
import { renderWithProviders } from '@lib/test-wrappers.utils';

describe('Toaster', () => {
  it('should render without crashing', () => {
    const { container } = renderWithProviders(<Toaster />);
    expect(container).toBeDefined();
  });
});
