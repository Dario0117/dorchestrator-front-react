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
  return {
    define: {
      // Inject git SHA as environment variable for production builds
      'import.meta.env.VITE_APP_VERSION': JSON.stringify(gitSha),
      'import.meta.env.BACKEND_BASE_URL': "'http://localhost:9000'",
    },
    test: {
      watch: false,
      globals: true,
      parallel: true,
      environment: 'jsdom',
      setupFiles: './testsSetup.ts',
      coverage: {
        provider: 'v8',
        reporter: ['html', 'json'],
        exclude: [
          '.storybook/**',
          '**/*.types.ts',
          '**/*.stories.tsx',
          '**/http-service-setup.ts',
          '**/routeTree.gen.ts',
          '**/src/app.tsx',
          '**/src/context/query.provider.tsx',
          '**/src/main.tsx',
          '**/src/routes/**',
          '**/src/types/**',
          '**/storybook-static/**',
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
        '@components': path.resolve(__dirname, './src/components'),
        '@services': path.resolve(__dirname, './src/services'),
        '@hooks': path.resolve(__dirname, './src/hooks'),
        '@lib': path.resolve(__dirname, './src/lib'),
        '@context': path.resolve(__dirname, './src/context'),
        '@stores': path.resolve(__dirname, './src/stores'),
        '@types': path.resolve(__dirname, './src/types'),
        '@routes': path.resolve(__dirname, './src/routes'),
        '@assets': path.resolve(__dirname, './src/assets'),
        '@': path.resolve(__dirname, './src'),
      },
    },
  };
});
