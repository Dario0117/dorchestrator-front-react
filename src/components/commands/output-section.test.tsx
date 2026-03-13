import { OutputSection } from '@components/commands/output-section';
import { renderWithProviders } from '@lib/test-wrappers.utils';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const defaultProps = {
  title: 'Standard Output (stdout)',
  content: 'hello world',
  commandId: 42,
  outputType: 'stdout' as const,
};

describe('OutputSection', () => {
  it('should render the title', () => {
    renderWithProviders(<OutputSection {...defaultProps} />);

    expect(screen.getByText('Standard Output (stdout)')).toBeInTheDocument();
  });

  it('should render the content when open by default', () => {
    renderWithProviders(<OutputSection {...defaultProps} />);

    expect(screen.getByText('hello world')).toBeInTheDocument();
  });

  it('should render nothing when content is null', () => {
    const { container } = renderWithProviders(
      <OutputSection
        {...defaultProps}
        content={null}
      />,
    );

    expect(container.innerHTML).toBe('');
  });

  it('should not show content when defaultOpen is false', () => {
    renderWithProviders(
      <OutputSection
        {...defaultProps}
        defaultOpen={false}
      />,
    );

    expect(screen.queryByText('hello world')).not.toBeInTheDocument();
  });

  it('should toggle content visibility when clicking the trigger', async () => {
    const user = userEvent.setup();
    renderWithProviders(<OutputSection {...defaultProps} />);

    const trigger = screen.getByRole('button', {
      name: 'Standard Output (stdout)',
    });

    await user.click(trigger);
    expect(screen.queryByText('hello world')).not.toBeInTheDocument();

    await user.click(trigger);
    expect(screen.getByText('hello world')).toBeInTheDocument();
  });

  it('should copy content to clipboard when clicking copy button', async () => {
    const user = userEvent.setup();
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: writeTextMock },
      writable: true,
      configurable: true,
    });

    renderWithProviders(<OutputSection {...defaultProps} />);

    const copyButton = screen.getByRole('button', { name: 'Copy stdout' });
    await user.click(copyButton);

    expect(writeTextMock).toHaveBeenCalledWith('hello world');
    expect(screen.getByText('Copied!')).toBeInTheDocument();
  });

  it('should trigger a download when clicking download button', async () => {
    const user = userEvent.setup();
    const clickMock = vi.fn();
    const originalCreateElement = document.createElement.bind(document);
    const createElementSpy = vi
      .spyOn(document, 'createElement')
      .mockImplementation((tag, options) => {
        if (tag === 'a') {
          const anchor = originalCreateElement('a', options);
          anchor.click = clickMock;
          return anchor;
        }
        return originalCreateElement(tag, options);
      });
    const createObjectURLMock = vi.fn().mockReturnValue('blob:test-url');
    const revokeObjectURLMock = vi.fn();
    vi.spyOn(URL, 'createObjectURL').mockImplementation(createObjectURLMock);
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(revokeObjectURLMock);

    renderWithProviders(<OutputSection {...defaultProps} />);

    const downloadButton = screen.getByRole('button', {
      name: 'Download stdout',
    });
    await user.click(downloadButton);

    expect(createObjectURLMock).toHaveBeenCalled();
    expect(clickMock).toHaveBeenCalled();
    expect(revokeObjectURLMock).toHaveBeenCalledWith('blob:test-url');

    createElementSpy.mockRestore();
  });

  it('should render copy and download buttons', () => {
    renderWithProviders(<OutputSection {...defaultProps} />);

    expect(
      screen.getByRole('button', { name: 'Copy stdout' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Download stdout' }),
    ).toBeInTheDocument();
  });

  it('should use stderr labels for stderr output type', () => {
    renderWithProviders(
      <OutputSection
        {...defaultProps}
        outputType="stderr"
        title="Standard Error (stderr)"
      />,
    );

    expect(
      screen.getByRole('button', { name: 'Copy stderr' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Download stderr' }),
    ).toBeInTheDocument();
  });
});
