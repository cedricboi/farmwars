import tailwindcss from '@tailwindcss/postcss';
import vinext from 'vinext';
import { defineConfig } from 'vite';
import hostingConfig from './.openai/hosting.json';

const { d1, r2 } = hostingConfig;

// Local classroom QA config. Production hosting continues to use vite.config.ts
// with the required Sites plugin; this variant avoids needing that hosted-only
// package while running the preview on a teacher's computer.
export default defineConfig(async () => {
  process.env.WRANGLER_WRITE_LOGS ??= 'false';
  process.env.WRANGLER_LOG_PATH ??= '.wrangler/logs';
  process.env.MINIFLARE_REGISTRY_PATH ??= '.wrangler/registry';
  const { cloudflare } = await import('@cloudflare/vite-plugin');
  return {
    css: { postcss: { plugins: [tailwindcss()] } },
    // The Codex in-app browser can load the page before Vite's HMR WebSocket is
    // available. Vite 8's console forwarder then tries to report that failure
    // through the missing socket and creates an unhandled-rejection loop. The
    // classroom game syncs through /api/rooms, not HMR, so keep both development
    // transports off for the stable local preview and reload after code changes.
    server: { hmr: false, forwardConsole: false },
    plugins: [
      vinext(),
      cloudflare({
        viteEnvironment: { name: 'rsc', childEnvironments: ['ssr'] },
        config: {
          main: 'vinext/server/app-router-entry',
          compatibility_flags: ['nodejs_compat'],
          d1_databases: d1 ? [{ binding: d1, database_name: 'site-creator-d1', database_id: '00000000-0000-4000-8000-000000000000' }] : [],
          r2_buckets: r2 ? [{ binding: r2, bucket_name: 'site-creator-r2' }] : [],
        },
      }),
    ],
  };
});
