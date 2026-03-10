import type {
  PlaybackSpeed,
  PlaybackState,
  RecordingEvent,
} from '@components/terminal/recording-player.types';
import type { RecordingChunkItem } from '@services/terminal/get-recording.http-service';
import type { Terminal } from '@xterm/xterm';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const MAX_DELAY_MS = 2000;

function applyResizeEvent(terminal: Terminal, data: string) {
  try {
    const { cols, rows } = JSON.parse(data) as {
      cols: number;
      rows: number;
    };
    terminal.resize(cols, rows);
  } catch {
    // Invalid resize data — skip
  }
}

const INITIAL_STATE: PlaybackState = {
  status: 'idle',
  speed: 1,
  currentEventIndex: 0,
  totalEvents: 0,
  elapsedMs: 0,
  totalDurationMs: 0,
};

function flattenEvents(chunks: RecordingChunkItem[]): RecordingEvent[] {
  return chunks.flatMap((c) => c.events);
}

function computeEventDelays(events: RecordingEvent[]): number[] {
  if (events.length === 0) {
    return [];
  }
  const delays = [0];
  for (let i = 1; i < events.length; i++) {
    const prevEvent = events[i - 1];
    const currEvent = events[i];
    if (!prevEvent || !currEvent) {
      continue;
    }
    const prev = new Date(prevEvent.timestamp).getTime();
    const curr = new Date(currEvent.timestamp).getTime();
    delays.push(Math.max(0, curr - prev));
  }
  return delays;
}

interface UseRecordingPlaybackParams {
  chunks: RecordingChunkItem[];
  durationSeconds: number;
  terminalRef: React.RefObject<Terminal | null>;
}

interface UseRecordingPlaybackReturn {
  playbackState: PlaybackState;
  events: RecordingEvent[];
  play: () => void;
  pause: () => void;
  restart: () => void;
  changeSpeed: (value: string) => void;
  scrub: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function useRecordingPlayback({
  chunks,
  durationSeconds,
  terminalRef,
}: UseRecordingPlaybackParams): UseRecordingPlaybackReturn {
  const playbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stateRef = useRef<PlaybackState>(INITIAL_STATE);

  const events = useMemo(() => flattenEvents(chunks), [chunks]);
  const delays = useMemo(() => computeEventDelays(events), [events]);

  const [playbackState, setPlaybackState] = useState<PlaybackState>({
    ...INITIAL_STATE,
    totalEvents: events.length,
    totalDurationMs: durationSeconds * 1000,
  });

  stateRef.current = playbackState;

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (playbackTimerRef.current) {
        clearTimeout(playbackTimerRef.current);
      }
    };
  }, []);

  const writeOutputEventsUpTo = useCallback(
    (targetIndex: number) => {
      const terminal = terminalRef.current;
      if (!terminal) {
        return;
      }
      terminal.reset();
      for (let i = 0; i <= targetIndex && i < events.length; i++) {
        const event = events[i];
        if (event?.type === 'output') {
          terminal.write(event.data);
        } else if (event?.type === 'resize') {
          applyResizeEvent(terminal, event.data);
        }
      }
    },
    [events, terminalRef],
  );

  const scheduleNextEvent = useCallback(
    (fromIndex: number) => {
      const state = stateRef.current;
      if (fromIndex >= events.length) {
        setPlaybackState((prev) => ({ ...prev, status: 'finished' }));
        return;
      }

      const terminal = terminalRef.current;
      if (!terminal) {
        return;
      }

      const eventDelay = Math.min(delays[fromIndex] ?? 0, MAX_DELAY_MS);
      const delay = eventDelay / state.speed;

      playbackTimerRef.current = setTimeout(() => {
        const event = events[fromIndex];
        if (event?.type === 'output') {
          terminal.write(event.data);
        } else if (event?.type === 'resize') {
          applyResizeEvent(terminal, event.data);
        }

        const elapsed = delays
          .slice(0, fromIndex + 1)
          .reduce((sum, d) => sum + d, 0);

        setPlaybackState((prev) => ({
          ...prev,
          currentEventIndex: fromIndex,
          elapsedMs: elapsed,
        }));

        scheduleNextEvent(fromIndex + 1);
      }, delay);
    },
    [events, delays, terminalRef],
  );

  const play = useCallback(() => {
    const state = stateRef.current;

    if (state.status === 'finished') {
      terminalRef.current?.reset();
      setPlaybackState((prev) => ({
        ...prev,
        status: 'playing',
        currentEventIndex: 0,
        elapsedMs: 0,
      }));
      scheduleNextEvent(0);
    } else if (state.status === 'paused') {
      setPlaybackState((prev) => ({ ...prev, status: 'playing' }));
      scheduleNextEvent(state.currentEventIndex + 1);
    } else {
      setPlaybackState((prev) => ({
        ...prev,
        status: 'playing',
        currentEventIndex: 0,
        elapsedMs: 0,
      }));
      scheduleNextEvent(0);
    }
  }, [scheduleNextEvent, terminalRef]);

  const pause = useCallback(() => {
    if (playbackTimerRef.current) {
      clearTimeout(playbackTimerRef.current);
      playbackTimerRef.current = null;
    }
    setPlaybackState((prev) => ({ ...prev, status: 'paused' }));
  }, []);

  const restart = useCallback(() => {
    if (playbackTimerRef.current) {
      clearTimeout(playbackTimerRef.current);
      playbackTimerRef.current = null;
    }
    writeOutputEventsUpTo(-1);
    setPlaybackState((prev) => ({
      ...prev,
      status: 'idle',
      currentEventIndex: 0,
      elapsedMs: 0,
    }));
  }, [writeOutputEventsUpTo]);

  const changeSpeed = useCallback(
    (value: string) => {
      const newSpeed = Number(value) as PlaybackSpeed;
      setPlaybackState((prev) => ({ ...prev, speed: newSpeed }));

      if (stateRef.current.status === 'playing') {
        if (playbackTimerRef.current) {
          clearTimeout(playbackTimerRef.current);
        }
        scheduleNextEvent(stateRef.current.currentEventIndex + 1);
      }
    },
    [scheduleNextEvent],
  );

  const scrub = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const targetIndex = Number(e.target.value);
      if (playbackTimerRef.current) {
        clearTimeout(playbackTimerRef.current);
        playbackTimerRef.current = null;
      }
      writeOutputEventsUpTo(targetIndex);

      const elapsed = delays
        .slice(0, targetIndex + 1)
        .reduce((sum, d) => sum + d, 0);

      setPlaybackState((prev) => ({
        ...prev,
        status: 'paused',
        currentEventIndex: targetIndex,
        elapsedMs: elapsed,
      }));
    },
    [writeOutputEventsUpTo, delays],
  );

  return { playbackState, events, play, pause, restart, changeSpeed, scrub };
}
