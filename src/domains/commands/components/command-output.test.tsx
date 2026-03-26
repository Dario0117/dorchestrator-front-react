import { CommandOutput } from '@domains/commands/components/command-output';
import type { GetCommandDetail } from '@domains/commands/services/get-command.http-service';
import { renderWithProviders } from '@lib/test-wrappers.utils';
import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

type CommandResults = GetCommandDetail['results'];

const resultsWithStdout: CommandResults = [
  {
    id: 1,
    stdout: 'hello world\n',
    stderr: null,
    exitCode: 0,
    createdAt: '2025-12-28T10:01:30.000Z',
  },
];

const resultsWithStderr: CommandResults = [
  {
    id: 1,
    stdout: 'partial output',
    stderr: 'error: something went wrong\n',
    exitCode: 1,
    createdAt: '2025-12-28T10:01:30.000Z',
  },
];

describe('CommandOutput', () => {
  it('should render stdout section when stdout is present', () => {
    renderWithProviders(
      <CommandOutput
        results={resultsWithStdout}
        commandId={1}
      />,
    );

    expect(screen.getByText('Standard Output (stdout)')).toBeInTheDocument();
    expect(screen.getByText(/hello world/)).toBeInTheDocument();
  });

  it('should not render stderr section when stderr is null', () => {
    renderWithProviders(
      <CommandOutput
        results={resultsWithStdout}
        commandId={1}
      />,
    );

    expect(
      screen.queryByText('Standard Error (stderr)'),
    ).not.toBeInTheDocument();
  });

  it('should render both stdout and stderr when present', () => {
    renderWithProviders(
      <CommandOutput
        results={resultsWithStderr}
        commandId={1}
      />,
    );

    expect(screen.getByText('Standard Output (stdout)')).toBeInTheDocument();
    expect(screen.getByText('Standard Error (stderr)')).toBeInTheDocument();
  });

  it('should display exit code 0 with green styling', () => {
    renderWithProviders(
      <CommandOutput
        results={resultsWithStdout}
        commandId={1}
      />,
    );

    const badge = screen.getByText('Exit code: 0');
    expect(badge).toBeInTheDocument();
  });

  it('should display non-zero exit code with red styling', () => {
    renderWithProviders(
      <CommandOutput
        results={resultsWithStderr}
        commandId={1}
      />,
    );

    const badge = screen.getByText('Exit code: 1');
    expect(badge).toBeInTheDocument();
  });

  it('should render nothing when results array is empty', () => {
    const { container } = renderWithProviders(
      <CommandOutput
        results={[]}
        commandId={1}
      />,
    );

    expect(container.firstChild).toBeNull();
  });

  it('should toggle stdout section when clicking trigger', async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <CommandOutput
        results={resultsWithStdout}
        commandId={1}
      />,
    );

    const trigger = screen.getByText('Standard Output (stdout)');
    expect(screen.getByText(/hello world/)).toBeInTheDocument();

    await user.click(trigger);

    expect(screen.queryByText(/hello world/)).not.toBeInTheDocument();
  });

  it('should render execution results card title', () => {
    renderWithProviders(
      <CommandOutput
        results={resultsWithStdout}
        commandId={1}
      />,
    );

    expect(screen.getByText('Execution Results')).toBeInTheDocument();
  });

  describe('Copy to clipboard', () => {
    let writeTextSpy: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      writeTextSpy = vi
        .spyOn(navigator.clipboard, 'writeText')
        .mockResolvedValue(undefined);
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should render copy button for stdout section', () => {
      renderWithProviders(
        <CommandOutput
          results={resultsWithStdout}
          commandId={1}
        />,
      );

      expect(
        screen.getByRole('button', { name: 'Copy stdout' }),
      ).toBeInTheDocument();
    });

    it('should render copy buttons for both sections when both have content', () => {
      renderWithProviders(
        <CommandOutput
          results={resultsWithStderr}
          commandId={1}
        />,
      );

      expect(
        screen.getByRole('button', { name: 'Copy stdout' }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Copy stderr' }),
      ).toBeInTheDocument();
    });

    it('should copy stdout content to clipboard on click', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <CommandOutput
          results={resultsWithStdout}
          commandId={1}
        />,
      );

      await user.click(screen.getByRole('button', { name: 'Copy stdout' }));

      await waitFor(() => {
        expect(writeTextSpy).toHaveBeenCalledWith('hello world\n');
      });
    });

    it('should show "Copied!" feedback after copying', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <CommandOutput
          results={resultsWithStdout}
          commandId={1}
        />,
      );

      await user.click(screen.getByRole('button', { name: 'Copy stdout' }));

      await waitFor(() => {
        expect(screen.getByText('Copied!')).toBeInTheDocument();
      });
      expect(
        screen.getByRole('button', { name: 'Copied' }),
      ).toBeInTheDocument();
    });

    it('should revert "Copied!" back to "Copy" after 2 seconds', async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true });

      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      renderWithProviders(
        <CommandOutput
          results={resultsWithStdout}
          commandId={1}
        />,
      );

      await user.click(screen.getByRole('button', { name: 'Copy stdout' }));

      await waitFor(() => {
        expect(screen.getByText('Copied!')).toBeInTheDocument();
      });

      act(() => {
        vi.advanceTimersByTime(2000);
      });

      await waitFor(() => {
        expect(screen.queryByText('Copied!')).not.toBeInTheDocument();
        expect(
          screen.getByRole('button', { name: 'Copy stdout' }),
        ).toBeInTheDocument();
      });

      vi.useRealTimers();
    });
  });

  describe('Download output', () => {
    it('should render download button for stdout section', () => {
      renderWithProviders(
        <CommandOutput
          results={resultsWithStdout}
          commandId={42}
        />,
      );

      expect(
        screen.getByRole('button', { name: 'Download stdout' }),
      ).toBeInTheDocument();
    });

    it('should render download buttons for both sections when both have content', () => {
      renderWithProviders(
        <CommandOutput
          results={resultsWithStderr}
          commandId={42}
        />,
      );

      expect(
        screen.getByRole('button', { name: 'Download stdout' }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Download stderr' }),
      ).toBeInTheDocument();
    });

    it('should trigger download with correct filename for stdout', async () => {
      const createObjectURL = vi.fn().mockReturnValue('blob:test-url');
      const revokeObjectURL = vi.fn();
      global.URL.createObjectURL = createObjectURL;
      global.URL.revokeObjectURL = revokeObjectURL;

      const clickSpy = vi.fn();
      const createElementOriginal = document.createElement.bind(document);
      vi.spyOn(document, 'createElement').mockImplementation((tag) => {
        const el = createElementOriginal(tag);
        if (tag === 'a') {
          el.click = clickSpy;
        }
        return el;
      });

      const user = userEvent.setup();
      renderWithProviders(
        <CommandOutput
          results={resultsWithStdout}
          commandId={42}
        />,
      );

      await user.click(screen.getByRole('button', { name: 'Download stdout' }));

      expect(createObjectURL).toHaveBeenCalledWith(expect.any(Blob));
      expect(clickSpy).toHaveBeenCalled();
      expect(revokeObjectURL).toHaveBeenCalledWith('blob:test-url');

      vi.restoreAllMocks();
    });

    it('should use correct filename pattern for stderr download', async () => {
      const createObjectURL = vi.fn().mockReturnValue('blob:test-url');
      const revokeObjectURL = vi.fn();
      global.URL.createObjectURL = createObjectURL;
      global.URL.revokeObjectURL = revokeObjectURL;

      let capturedDownload = '';
      const createElementOriginal = document.createElement.bind(document);
      vi.spyOn(document, 'createElement').mockImplementation((tag) => {
        const el = createElementOriginal(tag);
        if (tag === 'a') {
          el.click = vi.fn();
          const originalSetAttribute = el.setAttribute.bind(el);
          Object.defineProperty(el, 'download', {
            set(val) {
              capturedDownload = val;
              originalSetAttribute('download', val);
            },
            get() {
              return capturedDownload;
            },
          });
        }
        return el;
      });

      const user = userEvent.setup();
      renderWithProviders(
        <CommandOutput
          results={resultsWithStderr}
          commandId={42}
        />,
      );

      await user.click(screen.getByRole('button', { name: 'Download stderr' }));

      expect(capturedDownload).toBe('command-42-stderr.txt');

      vi.restoreAllMocks();
    });
  });
});
