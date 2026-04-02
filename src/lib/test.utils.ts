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
import { addTeamMemberHandler } from '@domains/org/services/teams/add-team-member.http-service.handlers';
import { createTeamHandler } from '@domains/org/services/teams/create-team.http-service.handlers';
import { getDefaultTeamHandler } from '@domains/org/services/teams/get-default-team.http-service.handlers';
import { listTeamMembersHandler } from '@domains/org/services/teams/list-team-members.http-service.handlers';
import { removeTeamMemberHandler } from '@domains/org/services/teams/remove-team-member.http-service.handlers';
import { setDefaultTeamHandler } from '@domains/org/services/teams/set-default-team.http-service.handlers';
import { getProfileHandler } from '@domains/org/services/users/get-profile.http-service.handlers';
import { loginHandler } from '@domains/org/services/users/login.http-service.handlers';
import { logoutHandler } from '@domains/org/services/users/logout.http-service.handlers';
import { logoutAllSessionsHandler } from '@domains/org/services/users/logout-all-sessions.http-service.handlers';
import { registerHandler } from '@domains/org/services/users/register.http-service.handlers';
import { resetPasswordHandler } from '@domains/org/services/users/reset-password.http-service.handlers';
import { updatePasswordHandler } from '@domains/org/services/users/update-password.http-service.handlers';
import { clearDeviceDefaultPresetHandler } from '@domains/sandbox/services/clear-device-default-preset.http-service.handlers';
import { createSandboxPresetHandler } from '@domains/sandbox/services/create-sandbox-preset.http-service.handlers';
import { deleteSandboxPresetHandler } from '@domains/sandbox/services/delete-sandbox-preset.http-service.handlers';
import { getDevicePluginsHandler } from '@domains/sandbox/services/get-device-plugins.http-service.handlers';
import { getDeviceSandboxConfigHandler } from '@domains/sandbox/services/get-device-sandbox-config.http-service.handlers';
import { installDevicePluginHandler } from '@domains/sandbox/services/install-device-plugin.http-service.handlers';
import { killDeviceSessionsHandler } from '@domains/sandbox/services/kill-device-sessions.http-service.handlers';
import { listMySandboxApprovalsHandler } from '@domains/sandbox/services/list-my-sandbox-approvals.http-service.handlers';
import { listSandboxApprovalsHandler } from '@domains/sandbox/services/list-sandbox-approvals.http-service.handlers';
import { listSandboxPresetsHandler } from '@domains/sandbox/services/list-sandbox-presets.http-service.handlers';
import { listSandboxTypesHandler } from '@domains/sandbox/services/list-sandbox-types.http-service.handlers';
import { refreshDevicePluginsHandler } from '@domains/sandbox/services/refresh-device-plugins.http-service.handlers';
import { requestSandboxOverrideHandler } from '@domains/sandbox/services/request-sandbox-override.http-service.handlers';
import { reviewSandboxApprovalHandler } from '@domains/sandbox/services/review-sandbox-approval.http-service.handlers';
import { setDeviceDefaultPresetHandler } from '@domains/sandbox/services/set-device-default-preset.http-service.handlers';
import { setOrgDefaultPresetHandler } from '@domains/sandbox/services/set-org-default-preset.http-service.handlers';
import { uninstallDevicePluginHandler } from '@domains/sandbox/services/uninstall-device-plugin.http-service.handlers';
import { updateSandboxPresetHandler } from '@domains/sandbox/services/update-sandbox-preset.http-service.handlers';
import { createBookmarkHandler } from '@domains/terminal/services/create-bookmark.http-service.handlers';
import { createShortcutHandler } from '@domains/terminal/services/create-shortcut.http-service.handlers';
import { createTerminalSessionHandler } from '@domains/terminal/services/create-terminal-session.http-service.handlers';
import { deleteBookmarkHandler } from '@domains/terminal/services/delete-bookmark.http-service.handlers';
import { deleteShortcutHandler } from '@domains/terminal/services/delete-shortcut.http-service.handlers';
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
import { getFileDownloadUrlHandler } from '@domains/terminal/services/get-file-download-url.http-service.handlers';
import { getRecordingHandler } from '@domains/terminal/services/get-recording.http-service.handlers';
import { getTerminalConfigHandler } from '@domains/terminal/services/get-terminal-config.http-service.handlers';
import { getTerminalSessionHandler } from '@domains/terminal/services/get-terminal-session.http-service.handlers';
import { listBookmarksHandler } from '@domains/terminal/services/list-bookmarks.http-service.handlers';
import { listSessionFilesHandler } from '@domains/terminal/services/list-session-files.http-service.handlers';
import { listSessionSuggestionsHandler } from '@domains/terminal/services/list-session-suggestions.http-service.handlers';
import { listTerminalSessionsHandler } from '@domains/terminal/services/list-terminal-sessions.http-service.handlers';
import { resolveShareLinkHandler } from '@domains/terminal/services/resolve-share-link.http-service.handlers';
import { respondToSuggestionHandler } from '@domains/terminal/services/respond-to-suggestion.http-service.handlers';
import { restoreRecordingHandler } from '@domains/terminal/services/restore-recording.http-service.handlers';
import { shareTerminalSessionHandler } from '@domains/terminal/services/share-terminal-session.http-service.handlers';
import { submitSuggestionHandler } from '@domains/terminal/services/submit-suggestion.http-service.handlers';
import { terminalAuthHandler } from '@domains/terminal/services/terminal-auth.http-service.handlers';
import { terminateTerminalSessionHandler } from '@domains/terminal/services/terminate-terminal-session.http-service.handlers';
import { unlockTerminalSessionHandler } from '@domains/terminal/services/unlock-terminal-session.http-service.handlers';
import { unshareTerminalSessionHandler } from '@domains/terminal/services/unshare-terminal-session.http-service.handlers';
import { updateBookmarkNoteHandler } from '@domains/terminal/services/update-bookmark-note.http-service.handlers';
import { updateDeviceConfigHandler } from '@domains/terminal/services/update-device-config.http-service.handlers';
import { updateShortcutHandler } from '@domains/terminal/services/update-shortcut.http-service.handlers';
import { updateTerminalConfigHandler } from '@domains/terminal/services/update-terminal-config.http-service.handlers';
import { uploadSessionFileHandler } from '@domains/terminal/services/upload-session-file.http-service.handlers';

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
    addTeamMemberHandler,
    createTeamHandler,
    getDefaultTeamHandler,
    listTeamMembersHandler,
    removeTeamMemberHandler,
    setDefaultTeamHandler,
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
    listBookmarksHandler,
    updateBookmarkNoteHandler,
    shareTerminalSessionHandler,
    unshareTerminalSessionHandler,
    resolveShareLinkHandler,
    extendTerminalSessionHandler,
    getFileDownloadUrlHandler,
    listSessionFilesHandler,
    uploadSessionFileHandler,
    getRecordingHandler,
    restoreRecordingHandler,
    createShortcutHandler,
    deleteShortcutHandler,
    updateShortcutHandler,
    listSessionSuggestionsHandler,
    submitSuggestionHandler,
    respondToSuggestionHandler,
    getDeviceSandboxConfigHandler,
    getDevicePluginsHandler,
    installDevicePluginHandler,
    uninstallDevicePluginHandler,
    listSandboxPresetsHandler,
    createSandboxPresetHandler,
    updateSandboxPresetHandler,
    deleteSandboxPresetHandler,
    setOrgDefaultPresetHandler,
    setDeviceDefaultPresetHandler,
    clearDeviceDefaultPresetHandler,
    listSandboxApprovalsHandler,
    requestSandboxOverrideHandler,
    reviewSandboxApprovalHandler,
    killDeviceSessionsHandler,
    refreshDevicePluginsHandler,
    listMySandboxApprovalsHandler,
    listSandboxTypesHandler,
  ];
}
