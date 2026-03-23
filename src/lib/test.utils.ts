import { listAuditLogsHandler } from '@domains/audit-logs/services/list-audit-logs.http-service.handlers';
import { getCommandHandler } from '@domains/commands/services/get-command.http-service.handlers';
import { listCommandsHandler } from '@domains/commands/services/list-commands.http-service.handlers';
import { submitCommandHandler } from '@domains/commands/services/submit-command.http-service.handlers';
import { generateDeviceTokenHandler } from '@domains/devices/services/generate-device-token.http-service.handlers';
import { listDevicesHandler } from '@domains/devices/services/list-devices.http-service.handlers';
import { removeDeviceHandler } from '@domains/devices/services/remove-device.http-service.handlers';
import { getUnreadCountHandler } from '@domains/notifications/services/get-unread-count.http-service.handlers';
import { listNotificationsHandler } from '@domains/notifications/services/list-notifications.http-service.handlers';
import {
  markAllNotificationsReadHandler,
  markNotificationReadHandler,
} from '@domains/notifications/services/mark-notification-read.http-service.handlers';
import { checkSlugAvailabilityHandler } from '@domains/org/services/organizations/check-slug-availability.http-service.handlers';
import { createOrganizationHandler } from '@domains/org/services/organizations/create-organization.http-service.handlers';
import { deleteOrganizationHandler } from '@domains/org/services/organizations/delete-organization.http-service.handlers';
import { getOrganizationDetailsHandler } from '@domains/org/services/organizations/get-organization-details.http-service.handlers';
import { getOrganizationStatsHandler } from '@domains/org/services/organizations/get-organization-stats.http-service.handlers';
import { leaveOrganizationHandler } from '@domains/org/services/organizations/leave-organization.http-service.handlers';
import { listMembersHandler } from '@domains/org/services/organizations/list-members.http-service.handlers';
import { listUserOrganizationsHandler } from '@domains/org/services/organizations/list-user-organizations.http-service.handlers';
import { removeMemberHandler } from '@domains/org/services/organizations/remove-member.http-service.handlers';
import { setDefaultOrganizationHandler } from '@domains/org/services/organizations/set-default-organization.http-service.handlers';
import { transferOwnershipHandler } from '@domains/org/services/organizations/transfer-ownership.http-service.handlers';
import { getProfileHandler } from '@domains/org/services/users/get-profile.http-service.handlers';
import { loginHandler } from '@domains/org/services/users/login.http-service.handlers';
import { logoutHandler } from '@domains/org/services/users/logout.http-service.handlers';
import { logoutAllSessionsHandler } from '@domains/org/services/users/logout-all-sessions.http-service.handlers';
import { registerHandler } from '@domains/org/services/users/register.http-service.handlers';
import { resetPasswordHandler } from '@domains/org/services/users/reset-password.http-service.handlers';
import { updatePasswordHandler } from '@domains/org/services/users/update-password.http-service.handlers';
import { createBookmarkHandler } from '@domains/terminal/services/create-bookmark.http-service.handlers';
import { createTerminalSessionHandler } from '@domains/terminal/services/create-terminal-session.http-service.handlers';
import { deleteBookmarkHandler } from '@domains/terminal/services/delete-bookmark.http-service.handlers';
import {
  cancelExportHandler,
  downloadExportFileHandler,
  downloadExportHandler,
  getExportStatusHandler,
  initiateExportHandler,
  pauseExportHandler,
  resumeExportHandler,
} from '@domains/terminal/services/export-session-history.http-service.handlers';
import { extendTerminalSessionHandler } from '@domains/terminal/services/extend-terminal-session.http-service.handlers';
import { getDeviceConfigHandler } from '@domains/terminal/services/get-device-config.http-service.handlers';
import { getEffectiveCeilingHandler } from '@domains/terminal/services/get-effective-ceiling.http-service.handlers';
import { getTerminalConfigHandler } from '@domains/terminal/services/get-terminal-config.http-service.handlers';
import { getTerminalSessionHandler } from '@domains/terminal/services/get-terminal-session.http-service.handlers';
import { listTerminalSessionsHandler } from '@domains/terminal/services/list-terminal-sessions.http-service.handlers';
import { shareTerminalSessionHandler } from '@domains/terminal/services/share-terminal-session.http-service.handlers';
import { terminalAuthHandler } from '@domains/terminal/services/terminal-auth.http-service.handlers';
import { terminateTerminalSessionHandler } from '@domains/terminal/services/terminate-terminal-session.http-service.handlers';
import { unlockTerminalSessionHandler } from '@domains/terminal/services/unlock-terminal-session.http-service.handlers';
import { unshareTerminalSessionHandler } from '@domains/terminal/services/unshare-terminal-session.http-service.handlers';
import { updateDeviceConfigHandler } from '@domains/terminal/services/update-device-config.http-service.handlers';
import { updateTerminalConfigHandler } from '@domains/terminal/services/update-terminal-config.http-service.handlers';

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
    getTerminalConfigHandler,
    updateTerminalConfigHandler,
    getDeviceConfigHandler,
    updateDeviceConfigHandler,
    getEffectiveCeilingHandler,
    terminateTerminalSessionHandler,
    initiateExportHandler,
    getExportStatusHandler,
    downloadExportHandler,
    downloadExportFileHandler,
    pauseExportHandler,
    resumeExportHandler,
    cancelExportHandler,
    createBookmarkHandler,
    deleteBookmarkHandler,
    shareTerminalSessionHandler,
    unshareTerminalSessionHandler,
    extendTerminalSessionHandler,
  ];
}
