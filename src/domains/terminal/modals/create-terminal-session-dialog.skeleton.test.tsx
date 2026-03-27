import { render } from '@testing-library/react';
import { CreateTerminalSessionDialogSkeleton } from './create-terminal-session-dialog.skeleton';

describe('CreateTerminalSessionDialogSkeleton', () => {
  it('renders skeleton placeholder elements', () => {
    const { container } = render(<CreateTerminalSessionDialogSkeleton />);
    const skeletons = container.querySelectorAll('[data-slot="skeleton"]');
    expect(skeletons).toHaveLength(2);
  });
});
