import { Button } from '@components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@components/ui/dropdown-menu';
import { ScrollArea } from '@components/ui/scroll-area';
import { useCurrentOrganization } from '@hooks/use-current-organization';
import { badgeStyles } from '@lib/badge-styles';
import { formatRelativeTime } from '@lib/format-relative-time';
import { cn } from '@lib/utils';
import { getUnreadCountQueryOptions } from '@services/notifications/get-unread-count.http-service';
import type { NotificationEntry } from '@services/notifications/list-notifications.http-service';
import { getNotificationsQueryOptions } from '@services/notifications/list-notifications.http-service';
import {
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
} from '@services/notifications/mark-notification-read.http-service';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from '@tanstack/react-router';
import { Bell, BellOff, CheckCheck } from 'lucide-react';
import { useState } from 'react';

type NotificationSeverity = NotificationEntry['severity'];

const SEVERITY_STYLES: Record<NotificationSeverity, string> = {
  success: badgeStyles.green,
  error: badgeStyles.red,
  warning: badgeStyles.amber,
  info: badgeStyles.blue,
};

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
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            aria-label="Notifications"
          />
        }
      >
        <Bell
          className={cn('h-5 w-5', unreadCount > 0 && 'animate-bell-shake')}
        />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-80 md:w-96"
        align="end"
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex items-center justify-between">
            <span>Notifications</span>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-1 text-xs"
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
          <div className="flex flex-col items-center gap-2 p-6 text-center">
            <BellOff className="h-8 w-8 text-muted-foreground/50" />
            <p className="text-sm font-medium text-muted-foreground">
              All caught up
            </p>
            <p className="text-xs text-muted-foreground/70">
              No notifications to show
            </p>
          </div>
        ) : (
          <ScrollArea className="max-h-80">
            <DropdownMenuGroup>
              {notifications.map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  className={cn(
                    'flex cursor-pointer flex-col items-start gap-1 p-3',
                    notification.read && 'opacity-60',
                  )}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex w-full items-start gap-2">
                    <div className="mt-1.5 flex h-2 w-2 shrink-0 items-center justify-center">
                      {!notification.read && (
                        <div className="h-2 w-2 rounded-full bg-green-500" />
                      )}
                    </div>
                    <span className="text-sm font-medium text-wrap">
                      {notification.message}
                    </span>
                  </div>
                  <div className="flex w-full items-center gap-2 ml-4">
                    <span className="text-xs text-muted-foreground">
                      {formatRelativeTime(notification.createdAt)}
                    </span>
                    <span
                      className={cn(
                        'rounded px-1.5 py-0.5 text-[10px] font-medium',
                        SEVERITY_STYLES[notification.severity],
                      )}
                    >
                      {SEVERITY_LABELS[notification.severity]}
                    </span>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </ScrollArea>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
