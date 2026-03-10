import { env } from '@lib/env.utils';
import type { paths } from '@myTypes/api.generated.types';
import { listAuditLogsHandler } from '@services/audit-logs/list-audit-logs.http-service.handlers';
import { getCommandHandler } from '@services/commands/get-command.http-service.handlers';
import { listCommandsHandler } from '@services/commands/list-commands.http-service.handlers';
import { submitCommandHandler } from '@services/commands/submit-command.http-service.handlers';
import { generateDeviceTokenHandler } from '@services/devices/generate-device-token.http-service.handlers';
import { listDevicesHandler } from '@services/devices/list-devices.http-service.handlers';
import { removeDeviceHandler } from '@services/devices/remove-device.http-service.handlers';
import { getUnreadCountHandler } from '@services/notifications/get-unread-count.http-service.handlers';
import { listNotificationsHandler } from '@services/notifications/list-notifications.http-service.handlers';
import {
  markAllNotificationsReadHandler,
  markNotificationReadHandler,
} from '@services/notifications/mark-notification-read.http-service.handlers';
import { checkSlugAvailabilityHandler } from '@services/organizations/check-slug-availability.http-service.handlers';
import { createOrganizationHandler } from '@services/organizations/create-organization.http-service.handlers';
import { deleteOrganizationHandler } from '@services/organizations/delete-organization.http-service.handlers';
import { getOrganizationDetailsHandler } from '@services/organizations/get-organization-details.http-service.handlers';
import { getOrganizationStatsHandler } from '@services/organizations/get-organization-stats.http-service.handlers';
import { leaveOrganizationHandler } from '@services/organizations/leave-organization.http-service.handlers';
import { listMembersHandler } from '@services/organizations/list-members.http-service.handlers';
import { listUserOrganizationsHandler } from '@services/organizations/list-user-organizations.http-service.handlers';
import { removeMemberHandler } from '@services/organizations/remove-member.http-service.handlers';
import { setDefaultOrganizationHandler } from '@services/organizations/set-default-organization.http-service.handlers';
import { transferOwnershipHandler } from '@services/organizations/transfer-ownership.http-service.handlers';
import { createTerminalSessionHandler } from '@services/terminal/create-terminal-session.http-service.handlers';
import { getDeviceConfigHandler } from '@services/terminal/get-device-config.http-service.handlers';
import { getEffectiveCeilingHandler } from '@services/terminal/get-effective-ceiling.http-service.handlers';
import { getTerminalConfigHandler } from '@services/terminal/get-terminal-config.http-service.handlers';
import { getTerminalSessionHandler } from '@services/terminal/get-terminal-session.http-service.handlers';
import { listSessionHistoryHandler } from '@services/terminal/list-session-history.http-service.handlers';
import { listTerminalSessionsHandler } from '@services/terminal/list-terminal-sessions.http-service.handlers';
import { terminalAuthHandler } from '@services/terminal/terminal-auth.http-service.handlers';
import { unlockTerminalSessionHandler } from '@services/terminal/unlock-terminal-session.http-service.handlers';
import { updateDeviceConfigHandler } from '@services/terminal/update-device-config.http-service.handlers';
import { updateTerminalConfigHandler } from '@services/terminal/update-terminal-config.http-service.handlers';
import { getProfileHandler } from '@services/users/get-profile.http-service.handlers';
import { loginHandler } from '@services/users/login.http-service.handlers';
import { logoutHandler } from '@services/users/logout.http-service.handlers';
import { logoutAllSessionsHandler } from '@services/users/logout-all-sessions.http-service.handlers';
import { registerHandler } from '@services/users/register.http-service.handlers';
import { resetPasswordHandler } from '@services/users/reset-password.http-service.handlers';
import { updatePasswordHandler } from '@services/users/update-password.http-service.handlers';

type OpenAPIPath = keyof paths & string;

function openApiPathToMSW(path: OpenAPIPath) {
  return path.replace(/\{([^}]+)\}/g, ':$1');
}
export function buildBackendUrl(path: OpenAPIPath) {
  return `${env.BACKEND_BASE_URL}${openApiPathToMSW(path)}`;
}

export function MSWSuccessHandlers() {
  return [
    getProfileHandler,
    loginHandler,
    logoutHandler,
    logoutAllSessionsHandler,
    registerHandler,
    resetPasswordHandler,
    updatePasswordHandler,
    checkSlugAvailabilityHandler,
    createOrganizationHandler,
    getOrganizationDetailsHandler,
    getOrganizationStatsHandler,
    listUserOrganizationsHandler,
    setDefaultOrganizationHandler,
    listMembersHandler,
    removeMemberHandler,
    leaveOrganizationHandler,
    deleteOrganizationHandler,
    transferOwnershipHandler,
    generateDeviceTokenHandler,
    listDevicesHandler,
    removeDeviceHandler,
    getCommandHandler,
    listCommandsHandler,
    submitCommandHandler,
    listAuditLogsHandler,
    listNotificationsHandler,
    getUnreadCountHandler,
    markNotificationReadHandler,
    markAllNotificationsReadHandler,
    terminalAuthHandler,
    unlockTerminalSessionHandler,
    createTerminalSessionHandler,
    getTerminalSessionHandler,
    listTerminalSessionsHandler,
    listSessionHistoryHandler,
    getTerminalConfigHandler,
    updateTerminalConfigHandler,
    getDeviceConfigHandler,
    updateDeviceConfigHandler,
    getEffectiveCeilingHandler,
  ];
}
