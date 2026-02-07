import { env } from '@lib/env.utils';
import type { paths } from '@myTypes/api.generated.types';
import { generateDeviceTokenHandler } from '@services/devices/generate-device-token.http-service.handlers';
import { listDevicesHandler } from '@services/devices/list-devices.http-service.handlers';
import { removeDeviceHandler } from '@services/devices/remove-device.http-service.handlers';
import { checkSlugAvailabilityHandler } from '@services/organizations/check-slug-availability.http-service.handlers';
import { createOrganizationHandler } from '@services/organizations/create-organization.http-service.handlers';
import { getOrganizationDetailsHandler } from '@services/organizations/get-organization-details.http-service.handlers';
import { getOrganizationStatsHandler } from '@services/organizations/get-organization-stats.http-service.handlers';
import { listUserOrganizationsHandler } from '@services/organizations/list-user-organizations.http-service.handlers';
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
    generateDeviceTokenHandler,
    listDevicesHandler,
    removeDeviceHandler,
  ];
}
