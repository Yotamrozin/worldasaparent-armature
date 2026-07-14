// @ts-check
import { defineConfig } from 'astro/config';
import { loadEnv } from 'vite';

import vercel from '@astrojs/vercel';
import sanity from '@sanity/astro';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

// astro.config runs in Node, where `.env` is NOT auto-loaded into process.env.
// Locally these come from `.env` (gitignored). On Vercel there is no `.env` —
// the values are set as project Environment Variables and injected into
// process.env at build time. Read the .env file via loadEnv, then fall back to
// process.env so a platform-provided value is always used. Without them the
// prerendered /admin Studio route throws "Configuration must contain projectId"
// and the build fails.
const env = loadEnv(process.env.NODE_ENV ?? 'development', process.cwd(), '');
const PUBLIC_SANITY_PROJECT_ID =
  env.PUBLIC_SANITY_PROJECT_ID ?? process.env.PUBLIC_SANITY_PROJECT_ID;
const PUBLIC_SANITY_DATASET =
  env.PUBLIC_SANITY_DATASET ?? process.env.PUBLIC_SANITY_DATASET;

// Workaround for @sanity/astro on Astro 7 / Vite 8 (rolldown): the integration's
// module-dedupe plugin aliases `sanity` to its package directory, and rolldown's
// dependency optimizer then fails to resolve the named exports that
// `sanity/structure` re-imports (useClient, useSchema, …), crashing pre-bundling
// and leaving the embedded Studio a blank screen in dev. This env var is the
// integration's built-in switch to disable that dedupe/alias plugin. Safe here
// because node_modules has a single copy of react/sanity/styled-components.
// Set before defineConfig so it's in effect when the integration initialises.
process.env.SANITY_ASTRO_DISABLE_MODULE_DEDUPE ??= '1';

// https://astro.build/config
export default defineConfig({
  // Hybrid rendering: pages are static by default and opt into
  // on-demand server rendering with `export const prerender = false`.
  output: 'static',
  adapter: vercel(),
  integrations: [
    sanity({
      projectId: PUBLIC_SANITY_PROJECT_ID,
      dataset: PUBLIC_SANITY_DATASET,
      // Recent API version so the draft perspective, source maps, and stega used
      // by visual editing behave as documented (integration default is older).
      apiVersion: '2025-02-19',
      // Embed Sanity Studio at /admin.
      studioBasePath: '/admin',
      useCdn: false,
      // @sanity/astro defaults to hash-based Studio routing when `output` is
      // 'static', which keeps the whole Studio on one prerendered page — but
      // full-page links (like the click-to-edit "Open in Studio" overlay,
      // which links to a literal /admin/intent/edit/... path) then 404,
      // since nothing on the server knows that path. Force browser routing:
      // we already run other routes on demand via the Vercel adapter, so a
      // real catch-all SSR route for /admin/* works fine here.
      studioRouterHistory: 'browser',
    }),
    react(),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
