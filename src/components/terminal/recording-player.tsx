import '@xterm/xterm/css/xterm.css';

import { SecondaryText } from '@components/ds/atoms/secondary-text';
import {
  type FileEventData,
  RecordingFileMarker,
} from '@components/terminal/recording-file-marker';
import type {
  PlaybackSpeed,
  RecordingPlayerProps,
} from '@components/terminal/recording-player.types';
import {
  collectFileEventsUpTo,
  formatTimestamp,
} from '@components/terminal/recording-player.utils';
import { useRecordingPlayback } from '@components/terminal/use-recording-playback';
import { Button } from '@components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/ui/select';
import { WebLinksAddon } from '@xterm/addon-web-links';
import { Terminal } from '@xterm/xterm';
import { Pause, Play, RotateCcw } from 'lucide-react';
import { useEffect, useMemo, useRef } from 'react';

const SPEED_OPTIONS: PlaybackSpeed[] = [0.5, 1, 2, 4];

export function RecordingPlayer({
  chunks,
  durationSeconds,
  fontSize = 14,
  organizationId,
  sessionId,
  fileMap,
}: RecordingPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const terminalRef = useRef<Terminal | null>(null);
  const fontSizeRef = useRef(fontSize);
  fontSizeRef.current = fontSize;

  const { playbackState, events, play, pause, restart, changeSpeed, scrub } =
    useRecordingPlayback({ chunks, durationSeconds, terminalRef });

  // Initialize xterm
  useEffect(() => {
    const container = containerRef.current;
    /* v8 ignore start -- ref is always attached to the rendered div */
    if (!container) {
      return;
    }
    /* v8 ignore stop */

    const terminal = new Terminal({
      cursorBlink: false,
      disableStdin: true,
      allowProposedApi: true,
      fontFamily: 'monospace',
      fontSize: fontSizeRef.current,
    });

    terminal.loadAddon(new WebLinksAddon());
    terminal.open(container);

    terminalRef.current = terminal;

    return () => {
      terminal.dispose();
      terminalRef.current = null;
    };
  }, []);

  // Update font size without re-creating terminal
  useEffect(() => {
    const terminal = terminalRef.current;
    /* v8 ignore start -- terminal is always initialized by the prior effect */
    if (!terminal) {
      return;
    }
    /* v8 ignore stop */
    terminal.options.fontSize = fontSize;
  }, [fontSize]);

  const visibleFileEvents = useMemo(
    () => collectFileEventsUpTo(events, playbackState.currentEventIndex),
    [events, playbackState.currentEventIndex],
  );

  const currentEvent = events[playbackState.currentEventIndex];
  const currentTimestamp = currentEvent
    ? formatTimestamp(currentEvent.timestamp)
    : '—';

  const lastEvent = events[events.length - 1];
  const endTimestamp = lastEvent ? formatTimestamp(lastEvent.timestamp) : '—';

  const isPlaying = playbackState.status === 'playing';

  return (
    <div className="flex flex-col gap-4">
      <div
        ref={containerRef}
        className="min-h-[300px] w-full overflow-auto rounded-md border bg-black"
        data-testid="recording-player-container"
      />

      <div className="flex flex-col gap-2 rounded-md border p-4">
        <div className="flex items-center gap-2">
          {isPlaying ? (
            <Button
              variant="outline"
              size="sm"
              onClick={pause}
              aria-label="Pause"
            >
              <Pause className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={play}
              aria-label="Play"
            >
              <Play className="h-4 w-4" />
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={restart}
            aria-label="Restart"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>

          <Select
            value={String(playbackState.speed)}
            onValueChange={changeSpeed}
          >
            <SelectTrigger
              aria-label="Playback speed"
              className="h-9 w-20"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SPEED_OPTIONS.map((speed) => (
                <SelectItem
                  key={speed}
                  value={String(speed)}
                >
                  {speed}x
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <SecondaryText className="ml-auto">
            Event {playbackState.currentEventIndex + 1} /{' '}
            {playbackState.totalEvents}
          </SecondaryText>
        </div>

        <input
          type="range"
          min={0}
          max={Math.max(0, events.length - 1)}
          value={playbackState.currentEventIndex}
          onChange={scrub}
          className="w-full"
          aria-label="Playback timeline"
        />

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{currentTimestamp}</span>
          <span>{endTimestamp}</span>
        </div>
      </div>

      {visibleFileEvents.length > 0 &&
        organizationId !== undefined &&
        sessionId !== undefined && (
          <div
            className="flex max-h-48 flex-col gap-2 overflow-y-auto"
            data-testid="recording-file-events-panel"
          >
            {visibleFileEvents.map((fileEvent) => (
              <RecordingFileMarker
                key={fileEvent.eventIndex}
                event={fileEvent.event as FileEventData}
                timestamp={fileEvent.timestamp}
                organizationId={organizationId}
                sessionId={sessionId}
                fileId={fileMap?.[fileEvent.event.filename] ?? null}
              />
            ))}
          </div>
        )}
    </div>
  );
}
