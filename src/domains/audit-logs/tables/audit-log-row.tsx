import { Badge } from '@components/ds/atoms/badge';
import { Box } from '@components/ds/atoms/box';
import { Button } from '@components/ds/atoms/button';
import { CodeBlock } from '@components/ds/atoms/code-block';
import { Flex } from '@components/ds/atoms/flex';
import { HStack } from '@components/ds/atoms/hstack';
import { InlineCode } from '@components/ds/atoms/inline-code';
import { Scrollable } from '@components/ds/atoms/scrollable';
import { SmallText } from '@components/ds/atoms/small-text';
import { TableCell, TableRow } from '@components/ds/atoms/table';
import type { AuditLogEntry } from '@domains/audit-logs/services/list-audit-logs.http-service';
import {
  AUDIT_LOG_RESOURCE_TYPE_LABELS,
  type AuditLogAction,
} from '@domains/audit-logs/services/list-audit-logs.http-service.constants';
import { getAllTeamsFromCache } from '@domains/org/services/teams/list-teams.http-service';
import { useCopyToClipboard } from '@domains/shared/hooks/use-copy-to-clipboard';
import type { BadgeStyle } from '@lib/badge-styles';
import { formatRelativeTime } from '@lib/format-relative-time';
import { Check, ChevronDown, ChevronUp, Copy } from 'lucide-react';
import { useMemo, useState } from 'react';

const ACTION_BADGE_CONFIG = {
  created: { label: 'Created', colorScheme: 'success' },
  updated: { label: 'Updated', colorScheme: 'info' },
  deleted: { label: 'Deleted', colorScheme: 'error' },
  deactivated: { label: 'Deactivated', colorScheme: 'warning' },
} as const satisfies Record<
  AuditLogAction,
  { label: string; colorScheme: BadgeStyle }
>;

interface AuditLogRowProps {
  entry: AuditLogEntry;
}

export function AuditLogRow({ entry }: AuditLogRowProps) {
  const [expanded, setExpanded] = useState(false);
  const { copiedKey, copy } = useCopyToClipboard();

  const actionConfig = ACTION_BADGE_CONFIG[entry.action];
  const resourceTypeLabel =
    AUDIT_LOG_RESOURCE_TYPE_LABELS[entry.resourceType] || entry.resourceType;
  const actorDisplay = entry.actorEmail ?? 'System';

  const teamId = (entry.metadata?.after as Record<string, unknown> | undefined)
    ?.teamId as string | undefined;
  const teamName = useMemo(() => {
    if (!teamId) {
      return null;
    }
    const teams = getAllTeamsFromCache();
    return teams.find((t) => t.id === teamId)?.name ?? null;
  }, [teamId]);

  const handleToggle = () => setExpanded((prev) => !prev);

  const handleCopy = (e: React.MouseEvent, text: string, key: string) => {
    e.stopPropagation();
    copy(text, key);
  };

  return (
    <>
      <TableRow
        clickable
        onClick={entry.metadata ? handleToggle : undefined}
        onKeyDown={
          entry.metadata
            ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleToggle();
                }
              }
            : undefined
        }
        tabIndex={entry.metadata ? 0 : undefined}
        role={entry.metadata ? 'button' : undefined}
        aria-expanded={entry.metadata ? expanded : undefined}
      >
        <TableCell>
          <SmallText
            color="muted"
            noWrap
          >
            {formatRelativeTime(entry.createdAt)}
          </SmallText>
        </TableCell>
        <TableCell>
          <Badge colorScheme={actionConfig.colorScheme}>
            {actionConfig.label}
          </Badge>
        </TableCell>
        <TableCell>
          <Badge variant="outline">{resourceTypeLabel}</Badge>
        </TableCell>
        <TableCell>
          {teamName ? (
            <SmallText
              color="muted"
              size="sm"
            >
              {teamName}
            </SmallText>
          ) : (
            <SmallText color="muted">—</SmallText>
          )}
        </TableCell>
        <TableCell>
          <HStack
            gap="xs"
            inline
          >
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={(e) => handleCopy(e, actorDisplay, 'actor')}
              aria-label="Copy actor"
            >
              {copiedKey === 'actor' ? (
                <Check className="h-3 w-3 text-success" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </Button>
            <SmallText
              color="muted"
              size="sm"
            >
              {actorDisplay}
            </SmallText>
          </HStack>
        </TableCell>
        <TableCell>
          <HStack
            gap="xs"
            inline
          >
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={(e) => handleCopy(e, entry.resourceId, 'resourceId')}
              aria-label="Copy resource ID"
            >
              {copiedKey === 'resourceId' ? (
                <Check className="h-3 w-3 text-success" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </Button>
            <InlineCode>{entry.resourceId}</InlineCode>
          </HStack>
        </TableCell>
        <TableCell>
          {entry.requestId ? (
            <HStack
              gap="xs"
              inline
            >
              <Button
                variant="ghost"
                size="icon-compact"
                onClick={(e) =>
                  handleCopy(e, entry.requestId as string, 'requestId')
                }
                aria-label="Copy request ID"
              >
                {copiedKey === 'requestId' ? (
                  <Check className="h-3 w-3 text-success" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </Button>
              <InlineCode>{entry.requestId}</InlineCode>
            </HStack>
          ) : (
            <SmallText color="muted">—</SmallText>
          )}
        </TableCell>
        <TableCell>
          {entry.metadata && (
            <Flex
              align="center"
              gap="xs"
            >
              {expanded ? (
                <ChevronUp className="h-3 w-3" />
              ) : (
                <ChevronDown className="h-3 w-3" />
              )}
            </Flex>
          )}
        </TableCell>
      </TableRow>
      {expanded && entry.metadata && (
        <TableRow>
          <TableCell
            colSpan={8}
            bg="muted/50"
            padding="none"
          >
            <Scrollable
              innerSpaceX="md"
              innerSpaceY="md"
              overflow="auto"
              maxH="md"
            >
              {entry.metadata.before && (
                <Box spaceBelow="sm">
                  <SmallText
                    color="muted"
                    weight="semibold"
                  >
                    Before:
                  </SmallText>
                  <CodeBlock spaceAbove="sm">
                    {JSON.stringify(entry.metadata.before, null, 2)}
                  </CodeBlock>
                </Box>
              )}
              {entry.metadata.after && (
                <Box>
                  <SmallText
                    color="muted"
                    weight="semibold"
                  >
                    After:
                  </SmallText>
                  <CodeBlock spaceAbove="sm">
                    {JSON.stringify(entry.metadata.after, null, 2)}
                  </CodeBlock>
                </Box>
              )}
              {!entry.metadata.before && !entry.metadata.after && (
                <CodeBlock>{JSON.stringify(entry.metadata, null, 2)}</CodeBlock>
              )}
            </Scrollable>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}
