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
import { formatRelativeTime } from '@lib/format-relative-time';
import { cn } from '@lib/utils';
import { getUnreadCountQueryOptions } from '@services/notifications/get-unread-count.http-service';
import type { NotificationEntry } from '@services/notifications/list-notifications.http-service';
import { getNotificationsQueryOptions } from '@services/notifications/list-notifications.http-service';
import {
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
} from '@services/notifications/mark-notification-read.http-service';
import { NOTIFICATION_POLLING_INTERVAL_MS } from '@services/notifications/notification.constants';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from '@tanstack/react-router';
import { Bell, CheckCheck } from 'lucide-react';
import { useState } from 'react';

type NotificationSeverity = NotificationEntry['severity'];

const SEVERITY_STYLES: Record<NotificationSeverity, string> = {
  success:
    'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  error: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  warning:
    'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
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
  const currentOrganization = useCurrentOrganization();
  const organizationId = currentOrganization.id;
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const { data: countData } = useQuery({
    ...getUnreadCountQueryOptions(organizationId),
    refetchInterval: NOTIFICATION_POLLING_INTERVAL_MS,
  });

  const notificationsQueryOptions =
    getNotificationsQueryOptions(organizationId);
  const { data: notificationsData } = useQuery({
    ...notificationsQueryOptions,
    enabled: isOpen,
  });

  const markReadMutation = useMarkNotificationReadMutation();
  const markAllReadMutation = useMarkAllNotificationsReadMutation();

  const notifications = notificationsData?.responseData?.results ?? [];
  const unreadCount = countData?.responseData?.results?.count ?? 0;

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
          to: '/$organizationSlug/commands/$commandId',
          params: { organizationSlug, commandId: notification.resourceId },
        });
        break;
      case 'device':
        navigate({
          to: '/$organizationSlug',
          params: { organizationSlug },
        });
        break;
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
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-80 md:w-96"
        align="end"
        forceMount
      >
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
        <DropdownMenuSeparator />
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            No notifications
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
                  <span className="w-full text-sm font-medium text-wrap">
                    {notification.message}
                  </span>
                  <div className="flex w-full items-center gap-2">
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
