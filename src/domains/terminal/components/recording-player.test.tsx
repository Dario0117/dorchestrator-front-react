import { RecordingPlayer } from '@domains/terminal/components/recording-player';
import type { RecordingChunkItem } from '@domains/terminal/services/get-recording.http-service';
import { renderWithProviders } from '@lib/test-wrappers.utils';
import { act, fireEvent, screen } from '@testing-library/react';

const mockTerminalWrite = vi.fn();
const mockTerminalOpen = vi.fn();
const mockTerminalDispose = vi.fn();
const mockTerminalReset = vi.fn();
const mockLoadAddon = vi.fn();

vi.mock('@xterm/xterm', () => {
  function MockTerminal() {
    return {
      open: mockTerminalOpen,
      write: mockTerminalWrite,
      dispose: mockTerminalDispose,
      reset: mockTerminalReset,
      loadAddon: mockLoadAddon,
      options: { fontSize: 14 },
      cols: 80,
      rows: 24,
    };
  }
  return { Terminal: MockTerminal };
});

vi.mock('@xterm/addon-web-links', () => {
  function MockWebLinksAddon() {
    return { dispose: vi.fn() };
  }
  return { WebLinksAddon: MockWebLinksAddon };
});

const chunks: RecordingChunkItem[] = [
  {
    sequenceNumber: 0,
    timestamp: '2024-01-01T00:00:00.000Z',
    sizeBytes: 100,
    events: [
      {
        type: 'output',
        data: 'hello',
        timestamp: '2024-01-01T00:00:00.000Z',
      },
      {
        type: 'output',
        data: ' world',
        timestamp: '2024-01-01T00:00:01.000Z',
      },
    ],
  },
];

const fileEventData = JSON.stringify({
  filename: 'screenshot.png',
  mimeType: 'image/png',
  sizeBytes: 2048,
  writtenPath: '/tmp/screenshot.png',
  transferId: 'tx-1',
});

const chunksWithFileEvents: RecordingChunkItem[] = [
  {
    sequenceNumber: 0,
    timestamp: '2024-01-01T00:00:00.000Z',
    sizeBytes: 200,
    events: [
      {
        type: 'output',
        data: 'hello',
        timestamp: '2024-01-01T00:00:00.000Z',
      },
      {
        type: 'file',
        data: fileEventData,
        timestamp: '2024-01-01T00:00:01.000Z',
      },
    ],
  },
];

const emptyChunks: RecordingChunkItem[] = [
  {
    sequenceNumber: 0,
    timestamp: '2024-01-01T00:00:00.000Z',
    sizeBytes: 0,
    events: [],
  },
];

describe('RecordingPlayer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the terminal container', () => {
    renderWithProviders(
      <RecordingPlayer
        chunks={chunks}
        durationSeconds={1}
      />,
    );

    expect(
      screen.getByTestId('recording-player-container'),
    ).toBeInTheDocument();
  });

  it('should initialize xterm terminal on mount', () => {
    renderWithProviders(
      <RecordingPlayer
        chunks={chunks}
        durationSeconds={1}
      />,
    );

    expect(mockTerminalOpen).toHaveBeenCalled();
    expect(mockLoadAddon).toHaveBeenCalled();
  });

  it('should render play button in initial state', () => {
    renderWithProviders(
      <RecordingPlayer
        chunks={chunks}
        durationSeconds={1}
      />,
    );

    expect(screen.getByRole('button', { name: 'Play' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Restart' })).toBeInTheDocument();
  });

  it('should show pause button when playing', () => {
    vi.useFakeTimers();

    renderWithProviders(
      <RecordingPlayer
        chunks={chunks}
        durationSeconds={1}
      />,
    );

    act(() => {
      fireEvent.click(screen.getByRole('button', { name: 'Play' }));
    });

    expect(screen.getByRole('button', { name: 'Pause' })).toBeInTheDocument();

    vi.useRealTimers();
  });

  it('should show play button after pausing', () => {
    vi.useFakeTimers();

    renderWithProviders(
      <RecordingPlayer
        chunks={chunks}
        durationSeconds={1}
      />,
    );

    act(() => {
      fireEvent.click(screen.getByRole('button', { name: 'Play' }));
    });

    act(() => {
      fireEvent.click(screen.getByRole('button', { name: 'Pause' }));
    });

    expect(screen.getByRole('button', { name: 'Play' })).toBeInTheDocument();

    vi.useRealTimers();
  });

  it('should render event counter', () => {
    renderWithProviders(
      <RecordingPlayer
        chunks={chunks}
        durationSeconds={1}
      />,
    );

    expect(screen.getByText(/Event 1 \/ 2/)).toBeInTheDocument();
  });

  it('should render playback speed selector', () => {
    renderWithProviders(
      <RecordingPlayer
        chunks={chunks}
        durationSeconds={1}
      />,
    );

    expect(
      screen.getByRole('combobox', { name: 'Playback speed' }),
    ).toBeInTheDocument();
  });

  it('should render timeline slider', () => {
    renderWithProviders(
      <RecordingPlayer
        chunks={chunks}
        durationSeconds={1}
      />,
    );

    expect(
      screen.getByRole('slider', { name: 'Playback timeline' }),
    ).toBeInTheDocument();
  });

  it('should display timestamps when events exist', () => {
    renderWithProviders(
      <RecordingPlayer
        chunks={chunks}
        durationSeconds={1}
      />,
    );

    expect(screen.queryByText('—')).not.toBeInTheDocument();
  });

  it('should display em-dash when no events', () => {
    renderWithProviders(
      <RecordingPlayer
        chunks={emptyChunks}
        durationSeconds={0}
      />,
    );

    const dashes = screen.getAllByText('—');
    expect(dashes.length).toBe(2);
  });

  it('should not render file events panel without organizationId and sessionId', () => {
    renderWithProviders(
      <RecordingPlayer
        chunks={chunksWithFileEvents}
        durationSeconds={1}
      />,
    );

    expect(
      screen.queryByTestId('recording-file-events-panel'),
    ).not.toBeInTheDocument();
  });

  it('should render file events panel when organizationId, sessionId, and file events exist', () => {
    vi.useFakeTimers();

    renderWithProviders(
      <RecordingPlayer
        chunks={chunksWithFileEvents}
        durationSeconds={1}
        organizationId="org-1"
        sessionId={1}
        fileMap={{ 'screenshot.png': 42 }}
      />,
    );

    act(() => {
      fireEvent.click(screen.getByRole('button', { name: 'Play' }));
    });

    act(() => {
      vi.advanceTimersByTime(0);
    });

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(
      screen.getByTestId('recording-file-events-panel'),
    ).toBeInTheDocument();
    expect(screen.getByTestId('recording-file-marker')).toBeInTheDocument();

    vi.useRealTimers();
  });

  it('should not render file events panel when organizationId is undefined', () => {
    vi.useFakeTimers();

    renderWithProviders(
      <RecordingPlayer
        chunks={chunksWithFileEvents}
        durationSeconds={1}
        sessionId={1}
      />,
    );

    act(() => {
      fireEvent.click(screen.getByRole('button', { name: 'Play' }));
    });

    act(() => {
      vi.advanceTimersByTime(0);
    });

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(
      screen.queryByTestId('recording-file-events-panel'),
    ).not.toBeInTheDocument();

    vi.useRealTimers();
  });

  it('should not render file events panel when sessionId is undefined', () => {
    vi.useFakeTimers();

    renderWithProviders(
      <RecordingPlayer
        chunks={chunksWithFileEvents}
        durationSeconds={1}
        organizationId="org-1"
      />,
    );

    act(() => {
      fireEvent.click(screen.getByRole('button', { name: 'Play' }));
    });

    act(() => {
      vi.advanceTimersByTime(0);
    });

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(
      screen.queryByTestId('recording-file-events-panel'),
    ).not.toBeInTheDocument();

    vi.useRealTimers();
  });

  it('should accept custom fontSize prop', () => {
    renderWithProviders(
      <RecordingPlayer
        chunks={chunks}
        durationSeconds={1}
        fontSize={18}
      />,
    );

    expect(
      screen.getByTestId('recording-player-container'),
    ).toBeInTheDocument();
  });

  it('should handle restart button click', () => {
    vi.useFakeTimers();

    renderWithProviders(
      <RecordingPlayer
        chunks={chunks}
        durationSeconds={1}
      />,
    );

    act(() => {
      fireEvent.click(screen.getByRole('button', { name: 'Play' }));
    });

    act(() => {
      fireEvent.click(screen.getByRole('button', { name: 'Restart' }));
    });

    expect(screen.getByRole('button', { name: 'Play' })).toBeInTheDocument();

    vi.useRealTimers();
  });

  it('should render file marker with fileMap fallback when image not in map', () => {
    vi.useFakeTimers();

    renderWithProviders(
      <RecordingPlayer
        chunks={chunksWithFileEvents}
        durationSeconds={1}
        organizationId="org-1"
        sessionId={1}
        fileMap={{}}
      />,
    );

    act(() => {
      fireEvent.click(screen.getByRole('button', { name: 'Play' }));
    });

    act(() => {
      vi.advanceTimersByTime(0);
    });

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(
      screen.getByTestId('recording-file-events-panel'),
    ).toBeInTheDocument();
    expect(screen.getByTestId('recording-file-marker')).toBeInTheDocument();

    vi.useRealTimers();
  });

  it('should render file marker without fileMap prop', () => {
    vi.useFakeTimers();

    renderWithProviders(
      <RecordingPlayer
        chunks={chunksWithFileEvents}
        durationSeconds={1}
        organizationId="org-1"
        sessionId={1}
      />,
    );

    act(() => {
      fireEvent.click(screen.getByRole('button', { name: 'Play' }));
    });

    act(() => {
      vi.advanceTimersByTime(0);
    });

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(
      screen.getByTestId('recording-file-events-panel'),
    ).toBeInTheDocument();

    vi.useRealTimers();
  });
});
