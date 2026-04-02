import { Badge } from '@components/ds/atoms/badge';
import { Button } from '@components/ds/atoms/button';
import { Center } from '@components/ds/atoms/center';
import { CounterBadge } from '@components/ds/atoms/counter-badge';
import { HStack } from '@components/ds/atoms/hstack';
import { Positioned } from '@components/ds/atoms/positioned';
import { ScrollArea } from '@components/ds/atoms/scroll-area';
import { SecondaryParagraph } from '@components/ds/atoms/secondary-paragraph';
import { SmallText } from '@components/ds/atoms/small-text';
import { Stack } from '@components/ds/atoms/stack';
import { StatusDot } from '@components/ds/atoms/status-dot';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@components/ds/molecules/dropdown-menu';
import { getUnreadCountQueryOptions } from '@domains/notifications/services/get-unread-count.http-service';
import type { NotificationEntry } from '@domains/notifications/services/list-notifications.http-service';
import { getNotificationsQueryOptions } from '@domains/notifications/services/list-notifications.http-service';
import {
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
} from '@domains/notifications/services/mark-notification-read.http-service';
import { useCurrentOrganization } from '@domains/shared/hooks/use-current-organization';
import { formatRelativeTime } from '@lib/format-relative-time';
import { cn } from '@lib/utils';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useParams, useRouterState } from '@tanstack/react-router';
import { Bell, BellOff, CheckCheck } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

type NotificationSeverity = NotificationEntry['severity'];

const SEVERITY_LABELS: Record<NotificationSeverity, string> = {
  success: 'Success',
  error: 'Error',
  warning: 'Warning',
  info: 'Info',
};

export function NotificationPanel() {
  const params = useParams({ strict: false });
  const organizationSlug =
    'organizationSlug' in params ? (params.organizationSlug as string) : '';
  const teamSlug = 'teamSlug' in params ? (params.teamSlug as string) : '';
  const currentOrganization = useCurrentOrganization();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const prevPathnameRef = useRef(pathname);

  useEffect(() => {
    if (prevPathnameRef.current !== pathname && isOpen) {
      setIsOpen(false);
    }
    prevPathnameRef.current = pathname;
  }, [pathname, isOpen]);

  const organizationId = currentOrganization?.id ?? '';

  const { data: countData } = useQuery({
    ...getUnreadCountQueryOptions(organizationId),
    enabled: !!currentOrganization,
  });

  const notificationsQueryOptions =
    getNotificationsQueryOptions(organizationId);
  const { data: notificationsData } = useQuery({
    ...notificationsQueryOptions,
    enabled: isOpen && !!currentOrganization,
  });

  const markReadMutation = useMarkNotificationReadMutation();
  const markAllReadMutation = useMarkAllNotificationsReadMutation();

  const notifications = notificationsData?.responseData?.results ?? [];
  const unreadCount = countData?.responseData?.results?.count ?? 0;

  if (!currentOrganization) {
    return null;
  }

  function handleNotificationClick(notification: NotificationEntry) {
    setIsOpen(false);
    if (!notification.read) {
      markReadMutation.mutate({
        params: {
          path: {
            organizationId,
            notificationId: notification.id,
          },
        },
      });
    }
    switch (notification.resourceType) {
      case 'command':
        navigate({
          to: '/$organizationSlug/t/$teamSlug/commands/$commandId',
          params: {
            organizationSlug,
            teamSlug,
            commandId: notification.resourceId,
          },
        });
        break;
      case 'device':
        navigate({
          to: '/$organizationSlug',
          params: { organizationSlug },
        });
        break;
      case 'terminal_session':
        navigate({
          to: '/$organizationSlug/t/$teamSlug/terminal/$sessionId',
          params: {
            organizationSlug,
            teamSlug,
            sessionId: notification.resourceId,
          },
        });
        break;
      case 'sandbox':
        // Informational — no specific page to navigate to
        break;
      /* v8 ignore next 4 -- exhaustive check */
      default: {
        const _exhaustive: never = notification.resourceType;
        return _exhaustive;
      }
    }
  }

  function handleMarkAllRead() {
    markAllReadMutation.mutate({
      params: {
        path: {
          organizationId,
        },
      },
    });
  }

  return (
    <DropdownMenu
      modal={false}
      open={isOpen}
      onOpenChange={setIsOpen}
    >
      <Positioned position="relative">
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="icon"
              aria-label="Notifications"
            />
          }
        >
          <Bell
            className={cn('h-5 w-5', unreadCount > 0 && 'animate-bell-shake')}
          />
        </DropdownMenuTrigger>
        {unreadCount > 0 && <CounterBadge count={unreadCount} />}
      </Positioned>
      <DropdownMenuContent
        width="md"
        align="end"
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel layout="between">
            <SmallText color="muted">Notifications</SmallText>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="inline"
                onClick={handleMarkAllRead}
              >
                <CheckCheck className="mr-1 h-3 w-3" />
                Mark all read
              </Button>
            )}
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        {notifications.length === 0 ? (
          <Stack
            gap="sm"
            align="center"
            innerSpaceX="xl"
            innerSpaceY="xl"
            textAlign="center"
          >
            <BellOff className="h-8 w-8 text-muted-foreground/50" />
            <SecondaryParagraph weight="medium">
              All caught up
            </SecondaryParagraph>
            <SecondaryParagraph size="xs">
              No notifications to show
            </SecondaryParagraph>
          </Stack>
        ) : (
          <ScrollArea maxHeight="80">
            <DropdownMenuGroup>
              {notifications.map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  layout="notification"
                  muted={notification.read}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <HStack
                    gap="sm"
                    align="stretch"
                    fullWidth
                  >
                    <Center
                      size="xs"
                      shrink={false}
                      spaceAbove="xs"
                    >
                      {!notification.read && (
                        <StatusDot
                          status="online"
                          size="sm"
                          aria-label="Unread"
                        />
                      )}
                    </Center>
                    <SmallText
                      color="muted"
                      size="sm"
                      weight="medium"
                      wrap
                    >
                      {notification.message}
                    </SmallText>
                  </HStack>
                  <HStack
                    gap="sm"
                    fullWidth
                    spaceLeft="md"
                  >
                    <SmallText color="muted">
                      {formatRelativeTime(notification.createdAt)}
                    </SmallText>
                    <Badge
                      variant="outline"
                      colorScheme={notification.severity}
                      tiny
                    >
                      {SEVERITY_LABELS[notification.severity]}
                    </Badge>
                  </HStack>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </ScrollArea>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
