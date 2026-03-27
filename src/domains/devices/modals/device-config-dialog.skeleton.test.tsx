import { render } from '@testing-library/react';
import { DeviceConfigDialogSkeleton } from './device-config-dialog.skeleton';

describe('DeviceConfigDialogSkeleton', () => {
  it('renders without crashing', () => {
    const { container } = render(<DeviceConfigDialogSkeleton />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders skeleton placeholder elements', () => {
    const { container } = render(<DeviceConfigDialogSkeleton />);
    const skeletons = container.querySelectorAll('[data-slot="skeleton"]');
    expect(skeletons).toHaveLength(3);
  });
});
