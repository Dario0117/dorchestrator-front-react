/// <reference types="vite/client" />

interface ImportMetaEnv {
  BACKEND_BASE_URL: string;
  FRONTEND_BASE_URL: string;
  VITE_APP_VERSION?: string;
  DEV: boolean;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
