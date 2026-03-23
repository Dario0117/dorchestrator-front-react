import '@xterm/xterm/css/xterm.css';

import { Box } from '@components/ds/atoms/box';
import { Button } from '@components/ds/atoms/button';
import { HStack } from '@components/ds/atoms/hstack';
import { RangeSlider } from '@components/ds/atoms/range-slider';
import { Scrollable } from '@components/ds/atoms/scrollable';
import { SecondaryText } from '@components/ds/atoms/secondary-text';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/ds/atoms/select';
import { SmallText } from '@components/ds/atoms/small-text';
import { Stack } from '@components/ds/atoms/stack';
import { Surface } from '@components/ds/atoms/surface';
import {
  type FileEventData,
  RecordingFileMarker,
} from '@domains/terminal/components/recording-file-marker';
import type {
  PlaybackSpeed,
  RecordingPlayerProps,
} from '@domains/terminal/components/recording-player.types';
import {
  collectFileEventsUpTo,
  formatTimestamp,
} from '@domains/terminal/components/recording-player.utils';
import { useRecordingPlayback } from '@domains/terminal/hooks/use-recording-playback';
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
    <Stack gap="lg">
      <Surface
        rounded="md"
        border="all"
        bg="black"
        fullWidth
      >
        <Scrollable
          overflow="auto"
          minH="md"
          fullWidth
          ref={containerRef}
          data-testid="recording-player-container"
        />
      </Surface>

      <Stack
        gap="sm"
        border="all"
        rounded="md"
        innerSpaceX="md"
        innerSpaceY="md"
      >
        <HStack gap="sm">
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
              width="compact"
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

          <Box spaceLeft="auto">
            <SecondaryText>
              Event {playbackState.currentEventIndex + 1} /{' '}
              {playbackState.totalEvents}
            </SecondaryText>
          </Box>
        </HStack>

        <RangeSlider
          min={0}
          max={Math.max(0, events.length - 1)}
          value={playbackState.currentEventIndex}
          onChange={scrub}
          aria-label="Playback timeline"
        />

        <HStack
          justify="between"
          textSize="xs"
        >
          <SmallText color="muted">{currentTimestamp}</SmallText>
          <SmallText color="muted">{endTimestamp}</SmallText>
        </HStack>
      </Stack>

      {visibleFileEvents.length > 0 &&
        organizationId !== undefined &&
        sessionId !== undefined && (
          <Stack
            gap="sm"
            maxH="sm"
            overflowY="auto"
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
          </Stack>
        )}
    </Stack>
  );
}
