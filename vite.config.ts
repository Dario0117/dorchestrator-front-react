import { execSync } from 'node:child_process';
import path from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv, type PluginOption } from 'vite';
import checker from 'vite-plugin-checker';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  // Get git SHA for version tracking
  let gitSha = 'unknown';
  try {
    gitSha = execSync('git rev-parse --short HEAD', {
      encoding: 'utf8',
    }).trim();
  } catch (_error) {
    // Silently fail if git is not available - gitSha will remain 'unknown'
  }

  /**
   * If autoCodeSplitting is true
   * it causes an issue with vs code debugger
   * this is only false if we run dev:debug command
   * for anything else this must be true
   */
  const isVSCodeDebug = env.VITE_IS_VSCODE_DEBUG === 'true';
  const isAgentTest = env.VITEST_IS_AGENT_TEST === 'true';
  const backendBaseUrl = env.VITE_BACKEND_BASE_URL;
  const frontendBaseUrl = env.VITE_FRONTEND_BASE_URL;

  return {
    define: {
      // Inject git SHA as environment variable for production builds
      'import.meta.env.VITE_APP_VERSION': JSON.stringify(gitSha),
      'import.meta.env.BACKEND_BASE_URL': JSON.stringify(backendBaseUrl),
      'import.meta.env.FRONTEND_BASE_URL': JSON.stringify(frontendBaseUrl),
    },
    test: {
      watch: false,
      globals: true,
      environment: 'jsdom',
      setupFiles: './testsSetup.ts',
      // Suppress known jsdom limitation messages that leak to console
      onConsoleLog: (log: string) => {
        if (
          log.includes('Not implemented: navigation') ||
          log.includes(
            'Not implemented: HTMLCanvasElement.prototype.getContext',
          )
        ) {
          return false;
        }
        return undefined;
      },
      // Limit parallel test execution for agent runs to prevent resource exhaustion
      // Vitest 4 uses top-level options instead of poolOptions
      ...(isAgentTest && {
        fileParallelism: false,
        maxWorkers: 1,
        maxConcurrency: 1,
      }),
      coverage: {
        provider: 'v8',
        reporter: ['html', 'json'],
        exclude: [
          '**/*.http-service.handlers.ts',
          '**/*.http-service.ts',
          '**/*.types.ts',
          '**/http-service-setup.ts',
          '**/routeTree.gen.ts',
          '**/src/app.tsx',
          '**/src/components/ui/**',
          '**/src/context/query.provider.tsx',
          '**/src/lib/observability/**',
          '**/src/main.tsx',
          '**/src/routes/**',
          '**/src/types/**',
          '**/vite-env.d.ts',
          '**/vite.config.ts',
          'docs/**',
        ],
      },
    },
    plugins: [
      tailwindcss() as PluginOption,
      tanstackRouter({
        target: 'react',
        autoCodeSplitting: !isVSCodeDebug,
      }) as PluginOption,
      react() as PluginOption,
      checker({
        typescript: true,
      }),
    ] as PluginOption[],
    resolve: {
      alias: {
        '@domains': path.resolve(__dirname, './src/domains'),
        '@components': path.resolve(__dirname, './src/components'),
        '@lib': path.resolve(__dirname, './src/lib'),
        '@routes': path.resolve(__dirname, './src/routes'),
        '@assets': path.resolve(__dirname, './src/assets'),
        '@': path.resolve(__dirname, './src'),
      },
    },
  };
});
