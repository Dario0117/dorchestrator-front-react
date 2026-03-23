import { env } from '@lib/env.utils';
import type { paths } from '@/types/api.generated.types';

type OpenAPIPath = keyof paths & string;

function openApiPathToMSW(path: OpenAPIPath) {
  return path.replace(/\{([^}]+)\}/g, ':$1');
}

export function buildBackendUrl(path: OpenAPIPath) {
  return `${env.BACKEND_BASE_URL}${openApiPathToMSW(path)}`;
}
