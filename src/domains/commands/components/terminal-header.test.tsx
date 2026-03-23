import { TerminalHeader } from '@domains/commands/components/terminal-header';
import { renderWithProviders } from '@lib/test-wrappers.utils';

describe('TerminalHeader', () => {
  it('should render three colored dots', () => {
    const { container } = renderWithProviders(<TerminalHeader />);

    const dots = container.querySelectorAll('[class*="rounded-full"]');
    expect(dots).toHaveLength(3);
  });
});
