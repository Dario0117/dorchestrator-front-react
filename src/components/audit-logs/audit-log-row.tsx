import { Badge } from '@components/ds/atoms/badge';
import { Button } from '@components/ds/atoms/button';
import { Flex } from '@components/ds/atoms/flex';
import { InlineCode } from '@components/ds/atoms/inline-code';
import { SmallText } from '@components/ds/atoms/small-text';
import { TableCell, TableRow } from '@components/ds/atoms/table';
import { useCopyToClipboard } from '@hooks/use-copy-to-clipboard';
import { badgeStyles } from '@lib/badge-styles';
import { formatRelativeTime } from '@lib/format-relative-time';
import { cn } from '@lib/utils';
import type { AuditLogEntry } from '@services/audit-logs/list-audit-logs.http-service';
import {
  AUDIT_LOG_RESOURCE_TYPE_LABELS,
  type AuditLogAction,
} from '@services/audit-logs/list-audit-logs.http-service.constants';
import { getAllTeamsFromCache } from '@services/teams/list-teams.http-service';
import { Check, ChevronDown, ChevronUp, Copy } from 'lucide-react';
import { useMemo, useState } from 'react';

const ACTION_BADGE_CONFIG = {
  created: { label: 'Created', className: badgeStyles.green },
  updated: { label: 'Updated', className: badgeStyles.blue },
  deleted: { label: 'Deleted', className: badgeStyles.red },
  deactivated: { label: 'Deactivated', className: badgeStyles.amber },
} as const satisfies Record<
  AuditLogAction,
  { label: string; className: string }
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
        className="cursor-pointer hover:bg-muted/50 transition-colors"
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
          <SmallText noWrap>{formatRelativeTime(entry.createdAt)}</SmallText>
        </TableCell>
        <TableCell>
          <Badge className={cn('border-0', actionConfig.className)}>
            {actionConfig.label}
          </Badge>
        </TableCell>
        <TableCell>
          <Badge variant="outline">{resourceTypeLabel}</Badge>
        </TableCell>
        <TableCell>
          {teamName ? (
            <span className="text-sm">{teamName}</span>
          ) : (
            <SmallText>—</SmallText>
          )}
        </TableCell>
        <TableCell>
          <span className="inline-flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={(e) => handleCopy(e, actorDisplay, 'actor')}
              aria-label="Copy actor"
            >
              {copiedKey === 'actor' ? (
                <Check className="h-3 w-3 text-green-600" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </Button>
            <span className="text-sm">{actorDisplay}</span>
          </span>
        </TableCell>
        <TableCell>
          <span className="inline-flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={(e) => handleCopy(e, entry.resourceId, 'resourceId')}
              aria-label="Copy resource ID"
            >
              {copiedKey === 'resourceId' ? (
                <Check className="h-3 w-3 text-green-600" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </Button>
            <InlineCode>{entry.resourceId}</InlineCode>
          </span>
        </TableCell>
        <TableCell>
          {entry.requestId ? (
            <span className="inline-flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={(e) =>
                  handleCopy(e, entry.requestId as string, 'requestId')
                }
                aria-label="Copy request ID"
              >
                {copiedKey === 'requestId' ? (
                  <Check className="h-3 w-3 text-green-600" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </Button>
              <InlineCode>{entry.requestId}</InlineCode>
            </span>
          ) : (
            <SmallText>—</SmallText>
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
            className="bg-muted/50 p-0"
          >
            <div className="p-4 text-xs font-mono overflow-auto max-h-64">
              {entry.metadata.before && (
                <div className="mb-2">
                  <span className="font-semibold text-muted-foreground">
                    Before:
                  </span>
                  <pre className="mt-1 whitespace-pre-wrap rounded-md border bg-muted p-3">
                    {JSON.stringify(entry.metadata.before, null, 2)}
                  </pre>
                </div>
              )}
              {entry.metadata.after && (
                <div>
                  <span className="font-semibold text-muted-foreground">
                    After:
                  </span>
                  <pre className="mt-1 whitespace-pre-wrap rounded-md border bg-muted p-3">
                    {JSON.stringify(entry.metadata.after, null, 2)}
                  </pre>
                </div>
              )}
              {!entry.metadata.before && !entry.metadata.after && (
                <pre className="whitespace-pre-wrap rounded-md border bg-muted p-3">
                  {JSON.stringify(entry.metadata, null, 2)}
                </pre>
              )}
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}
