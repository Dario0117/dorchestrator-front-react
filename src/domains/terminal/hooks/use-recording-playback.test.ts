import { useRecordingPlayback } from '@domains/terminal/hooks/use-recording-playback';
import type { RecordingChunkItem } from '@domains/terminal/services/get-recording.http-service';
import { act, renderHook } from '@testing-library/react';
import type { Terminal } from '@xterm/xterm';

const mockTerminal = {
  reset: vi.fn(),
  write: vi.fn(),
  resize: vi.fn(),
};
const terminalRef = {
  current: mockTerminal as unknown as Terminal,
};

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
      {
        type: 'resize',
        data: JSON.stringify({ cols: 80, rows: 24 }),
        timestamp: '2024-01-01T00:00:02.000Z',
      },
    ],
  },
];

const durationSeconds = 2;

describe('useRecordingPlayback', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockTerminal.reset.mockClear();
    mockTerminal.write.mockClear();
    mockTerminal.resize.mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test('initial state is idle with correct defaults', () => {
    const { result } = renderHook(() =>
      useRecordingPlayback({ chunks, durationSeconds, terminalRef }),
    );

    expect(result.current.playbackState.status).toBe('idle');
    expect(result.current.playbackState.speed).toBe(1);
    expect(result.current.playbackState.currentEventIndex).toBe(0);
    expect(result.current.playbackState.totalEvents).toBe(3);
    expect(result.current.playbackState.elapsedMs).toBe(0);
    expect(result.current.playbackState.totalDurationMs).toBe(2000);
  });

  test('events are flattened from chunks', () => {
    const { result } = renderHook(() =>
      useRecordingPlayback({ chunks, durationSeconds, terminalRef }),
    );

    expect(result.current.events).toHaveLength(3);
    expect(result.current.events[0]?.data).toBe('hello');
    expect(result.current.events[1]?.data).toBe(' world');
    expect(result.current.events[2]?.type).toBe('resize');
  });

  test('play transitions to playing and schedules events', () => {
    const { result } = renderHook(() =>
      useRecordingPlayback({ chunks, durationSeconds, terminalRef }),
    );

    act(() => {
      result.current.play();
    });

    expect(result.current.playbackState.status).toBe('playing');
  });

  test('output events write to terminal during playback', () => {
    const { result } = renderHook(() =>
      useRecordingPlayback({ chunks, durationSeconds, terminalRef }),
    );

    act(() => {
      result.current.play();
    });

    // First event has 0 delay
    act(() => {
      vi.advanceTimersByTime(0);
    });

    expect(mockTerminal.write).toHaveBeenCalledWith('hello');
  });

  test('resize events call terminal.resize with parsed cols/rows', () => {
    const { result } = renderHook(() =>
      useRecordingPlayback({ chunks, durationSeconds, terminalRef }),
    );

    act(() => {
      result.current.play();
    });

    // First event: 0ms delay
    act(() => {
      vi.advanceTimersByTime(0);
    });

    // Second event: 1000ms delay
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    // Third event (resize): 1000ms delay
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(mockTerminal.resize).toHaveBeenCalledWith(80, 24);
  });

  test('pause stops playback and sets status to paused', () => {
    const { result } = renderHook(() =>
      useRecordingPlayback({ chunks, durationSeconds, terminalRef }),
    );

    act(() => {
      result.current.play();
    });

    act(() => {
      result.current.pause();
    });

    expect(result.current.playbackState.status).toBe('paused');
  });

  test('restart resets to idle state and clears terminal', () => {
    const { result } = renderHook(() =>
      useRecordingPlayback({ chunks, durationSeconds, terminalRef }),
    );

    act(() => {
      result.current.play();
    });

    // Advance through first event
    act(() => {
      vi.advanceTimersByTime(0);
    });

    mockTerminal.reset.mockClear();

    act(() => {
      result.current.restart();
    });

    expect(result.current.playbackState.status).toBe('idle');
    expect(result.current.playbackState.currentEventIndex).toBe(0);
    expect(result.current.playbackState.elapsedMs).toBe(0);
    expect(mockTerminal.reset).toHaveBeenCalled();
  });

  test('changeSpeed updates speed in state', () => {
    const { result } = renderHook(() =>
      useRecordingPlayback({ chunks, durationSeconds, terminalRef }),
    );

    act(() => {
      result.current.changeSpeed('2');
    });

    expect(result.current.playbackState.speed).toBe(2);
  });

  test('changeSpeed reschedules events when playing', () => {
    const { result } = renderHook(() =>
      useRecordingPlayback({ chunks, durationSeconds, terminalRef }),
    );

    act(() => {
      result.current.play();
    });

    // Advance first event
    act(() => {
      vi.advanceTimersByTime(0);
    });

    mockTerminal.write.mockClear();

    act(() => {
      result.current.changeSpeed('4');
    });

    expect(result.current.playbackState.speed).toBe(4);
    // changeSpeed reads stateRef.current.speed which uses the previous render's value (1x)
    // so the scheduled delay is still 1000ms / 1 = 1000ms for this tick
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(mockTerminal.write).toHaveBeenCalledWith(' world');
  });

  test('scrub jumps to target event index and pauses', () => {
    const { result } = renderHook(() =>
      useRecordingPlayback({ chunks, durationSeconds, terminalRef }),
    );

    act(() => {
      result.current.play();
    });

    const scrubEvent = {
      target: { value: '1' },
    } as React.ChangeEvent<HTMLInputElement>;

    act(() => {
      result.current.scrub(scrubEvent);
    });

    expect(result.current.playbackState.status).toBe('paused');
    expect(result.current.playbackState.currentEventIndex).toBe(1);
    // Reset is called for writeOutputEventsUpTo, then events replayed
    expect(mockTerminal.reset).toHaveBeenCalled();
    expect(mockTerminal.write).toHaveBeenCalledWith('hello');
    expect(mockTerminal.write).toHaveBeenCalledWith(' world');
  });

  test('play after finished restarts from beginning', () => {
    const { result } = renderHook(() =>
      useRecordingPlayback({ chunks, durationSeconds, terminalRef }),
    );

    act(() => {
      result.current.play();
    });

    // Play through all events
    act(() => {
      vi.advanceTimersByTime(0);
    });
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    // Let the final schedule run (no more events, sets finished)
    act(() => {
      vi.advanceTimersByTime(0);
    });

    expect(result.current.playbackState.status).toBe('finished');

    mockTerminal.reset.mockClear();
    mockTerminal.write.mockClear();

    act(() => {
      result.current.play();
    });

    expect(result.current.playbackState.status).toBe('playing');
    expect(result.current.playbackState.currentEventIndex).toBe(0);
    expect(result.current.playbackState.elapsedMs).toBe(0);
    expect(mockTerminal.reset).toHaveBeenCalled();
  });

  test('play after pause resumes from current position', () => {
    const { result } = renderHook(() =>
      useRecordingPlayback({ chunks, durationSeconds, terminalRef }),
    );

    act(() => {
      result.current.play();
    });

    // Play first event
    act(() => {
      vi.advanceTimersByTime(0);
    });

    act(() => {
      result.current.pause();
    });

    expect(result.current.playbackState.status).toBe('paused');
    expect(result.current.playbackState.currentEventIndex).toBe(0);

    mockTerminal.write.mockClear();

    act(() => {
      result.current.play();
    });

    expect(result.current.playbackState.status).toBe('playing');

    // Should continue from next event (index 1), which has 1000ms delay
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(mockTerminal.write).toHaveBeenCalledWith(' world');
  });

  test('handles empty chunks', () => {
    const { result } = renderHook(() =>
      useRecordingPlayback({
        chunks: [],
        durationSeconds: 0,
        terminalRef,
      }),
    );

    expect(result.current.events).toHaveLength(0);
    expect(result.current.playbackState.totalEvents).toBe(0);
  });

  test('play with empty events immediately finishes', () => {
    const { result } = renderHook(() =>
      useRecordingPlayback({
        chunks: [],
        durationSeconds: 0,
        terminalRef,
      }),
    );

    act(() => {
      result.current.play();
    });

    expect(result.current.playbackState.status).toBe('finished');
  });

  test('resize event with invalid JSON is silently skipped', () => {
    const invalidChunks: RecordingChunkItem[] = [
      {
        sequenceNumber: 0,
        timestamp: '2024-01-01T00:00:00.000Z',
        sizeBytes: 50,
        events: [
          {
            type: 'resize',
            data: 'invalid json',
            timestamp: '2024-01-01T00:00:00.000Z',
          },
        ],
      },
    ];

    const { result } = renderHook(() =>
      useRecordingPlayback({
        chunks: invalidChunks,
        durationSeconds: 1,
        terminalRef,
      }),
    );

    act(() => {
      result.current.play();
    });

    act(() => {
      vi.advanceTimersByTime(0);
    });

    expect(mockTerminal.resize).not.toHaveBeenCalled();
  });

  test('delays are capped at MAX_DELAY_MS (2000ms)', () => {
    const longDelayChunks: RecordingChunkItem[] = [
      {
        sequenceNumber: 0,
        timestamp: '2024-01-01T00:00:00.000Z',
        sizeBytes: 200,
        events: [
          {
            type: 'output',
            data: 'first',
            timestamp: '2024-01-01T00:00:00.000Z',
          },
          {
            type: 'output',
            data: 'second',
            timestamp: '2024-01-01T00:00:10.000Z',
          },
        ],
      },
    ];

    const { result } = renderHook(() =>
      useRecordingPlayback({
        chunks: longDelayChunks,
        durationSeconds: 10,
        terminalRef,
      }),
    );

    act(() => {
      result.current.play();
    });

    // First event: 0 delay
    act(() => {
      vi.advanceTimersByTime(0);
    });

    mockTerminal.write.mockClear();

    // 10s gap should be capped at 2000ms at 1x speed
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(mockTerminal.write).toHaveBeenCalledWith('second');
  });

  test('cleanup clears timer on unmount', () => {
    const { result, unmount } = renderHook(() =>
      useRecordingPlayback({ chunks, durationSeconds, terminalRef }),
    );

    act(() => {
      result.current.play();
    });

    unmount();

    // Advancing timers after unmount should not cause issues
    act(() => {
      vi.advanceTimersByTime(10000);
    });
  });

  test('handles null terminal ref gracefully', () => {
    const nullRef = { current: null };

    const { result } = renderHook(() =>
      useRecordingPlayback({
        chunks,
        durationSeconds,
        terminalRef: nullRef as React.RefObject<Terminal | null>,
      }),
    );

    // Should not throw
    act(() => {
      result.current.play();
    });
  });

  test('writeOutputEventsUpTo returns early when terminal is null', () => {
    const nullRef = { current: null } as React.RefObject<Terminal | null>;

    const { result } = renderHook(() =>
      useRecordingPlayback({
        chunks,
        durationSeconds,
        terminalRef: nullRef,
      }),
    );

    // scrub calls writeOutputEventsUpTo internally
    const scrubEvent = {
      target: { value: '1' },
    } as React.ChangeEvent<HTMLInputElement>;

    act(() => {
      result.current.scrub(scrubEvent);
    });

    // terminal.reset should never be called since ref is null
    expect(mockTerminal.reset).not.toHaveBeenCalled();
  });

  test('scrub replays resize events via writeOutputEventsUpTo', () => {
    const { result } = renderHook(() =>
      useRecordingPlayback({ chunks, durationSeconds, terminalRef }),
    );

    mockTerminal.reset.mockClear();
    mockTerminal.write.mockClear();
    mockTerminal.resize.mockClear();

    // Scrub to index 2 (the resize event)
    const scrubEvent = {
      target: { value: '2' },
    } as React.ChangeEvent<HTMLInputElement>;

    act(() => {
      result.current.scrub(scrubEvent);
    });

    expect(mockTerminal.reset).toHaveBeenCalled();
    expect(mockTerminal.write).toHaveBeenCalledWith('hello');
    expect(mockTerminal.write).toHaveBeenCalledWith(' world');
    expect(mockTerminal.resize).toHaveBeenCalledWith(80, 24);
    expect(result.current.playbackState.currentEventIndex).toBe(2);
  });

  test('pause without active timer sets status to paused', () => {
    const { result } = renderHook(() =>
      useRecordingPlayback({ chunks, durationSeconds, terminalRef }),
    );

    // Pause without ever playing — no timer exists
    act(() => {
      result.current.pause();
    });

    expect(result.current.playbackState.status).toBe('paused');
  });

  test('restart without active timer resets state', () => {
    const { result } = renderHook(() =>
      useRecordingPlayback({ chunks, durationSeconds, terminalRef }),
    );

    mockTerminal.reset.mockClear();

    // Restart without playing — no timer to clear
    act(() => {
      result.current.restart();
    });

    expect(result.current.playbackState.status).toBe('idle');
    expect(result.current.playbackState.currentEventIndex).toBe(0);
    expect(mockTerminal.reset).toHaveBeenCalled();
  });

  test('scrub without active timer clears and pauses correctly', () => {
    const { result } = renderHook(() =>
      useRecordingPlayback({ chunks, durationSeconds, terminalRef }),
    );

    // Scrub without playing — no timer exists
    const scrubEvent = {
      target: { value: '0' },
    } as React.ChangeEvent<HTMLInputElement>;

    act(() => {
      result.current.scrub(scrubEvent);
    });

    expect(result.current.playbackState.status).toBe('paused');
    expect(result.current.playbackState.currentEventIndex).toBe(0);
  });

  test('changeSpeed while playing clears and reschedules timer', () => {
    const { result } = renderHook(() =>
      useRecordingPlayback({ chunks, durationSeconds, terminalRef }),
    );

    act(() => {
      result.current.play();
    });

    // Advance first event so we're mid-playback with a pending timer
    act(() => {
      vi.advanceTimersByTime(0);
    });

    mockTerminal.write.mockClear();

    // Change speed while playing — should clear existing timer and reschedule
    act(() => {
      result.current.changeSpeed('2');
    });

    // At 2x speed (but stateRef still has old speed=1 when scheduleNextEvent runs),
    // the delay for the next event (1000ms) / 1 = 1000ms
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(mockTerminal.write).toHaveBeenCalledWith(' world');
  });

  test('events with non-output non-resize types are skipped during playback', () => {
    const mixedChunks: RecordingChunkItem[] = [
      {
        sequenceNumber: 0,
        timestamp: '2024-01-01T00:00:00.000Z',
        sizeBytes: 100,
        events: [
          {
            type: 'input',
            data: 'some input',
            timestamp: '2024-01-01T00:00:00.000Z',
          },
          {
            type: 'output',
            data: 'result',
            timestamp: '2024-01-01T00:00:01.000Z',
          },
        ],
      },
    ];

    const { result } = renderHook(() =>
      useRecordingPlayback({
        chunks: mixedChunks,
        durationSeconds: 1,
        terminalRef,
      }),
    );

    mockTerminal.write.mockClear();
    mockTerminal.resize.mockClear();

    act(() => {
      result.current.play();
    });

    // First event is 'input' — should not write or resize
    act(() => {
      vi.advanceTimersByTime(0);
    });

    expect(mockTerminal.write).not.toHaveBeenCalled();
    expect(mockTerminal.resize).not.toHaveBeenCalled();

    // Second event is 'output' — should write
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(mockTerminal.write).toHaveBeenCalledWith('result');
  });

  test('scrub with input-type events skips them in writeOutputEventsUpTo', () => {
    const mixedChunks: RecordingChunkItem[] = [
      {
        sequenceNumber: 0,
        timestamp: '2024-01-01T00:00:00.000Z',
        sizeBytes: 100,
        events: [
          {
            type: 'input',
            data: 'some input',
            timestamp: '2024-01-01T00:00:00.000Z',
          },
          {
            type: 'file',
            data: 'file data',
            timestamp: '2024-01-01T00:00:01.000Z',
          },
        ],
      },
    ];

    const { result } = renderHook(() =>
      useRecordingPlayback({
        chunks: mixedChunks,
        durationSeconds: 1,
        terminalRef,
      }),
    );

    mockTerminal.write.mockClear();
    mockTerminal.resize.mockClear();
    mockTerminal.reset.mockClear();

    const scrubEvent = {
      target: { value: '1' },
    } as React.ChangeEvent<HTMLInputElement>;

    act(() => {
      result.current.scrub(scrubEvent);
    });

    // reset is called but neither write nor resize since both events are input/file
    expect(mockTerminal.reset).toHaveBeenCalled();
    expect(mockTerminal.write).not.toHaveBeenCalled();
    expect(mockTerminal.resize).not.toHaveBeenCalled();
  });

  test('scheduleNextEvent returns early when terminal ref becomes null', () => {
    const dynamicRef = {
      current: mockTerminal as unknown as Terminal,
    };

    const { result } = renderHook(() =>
      useRecordingPlayback({
        chunks,
        durationSeconds,
        terminalRef: dynamicRef as React.RefObject<Terminal | null>,
      }),
    );

    act(() => {
      result.current.play();
    });

    // First event fires
    act(() => {
      vi.advanceTimersByTime(0);
    });

    // Null out the terminal ref before next event
    dynamicRef.current = null as unknown as Terminal;

    // Advance — scheduleNextEvent should bail out due to null terminal
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    // Status should still be playing since scheduleNextEvent returned early
    // without setting finished
    expect(result.current.playbackState.status).toBe('playing');
  });
});
