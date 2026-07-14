import { defineCliConfig } from 'sanity/cli';

// Used by the Sanity CLI (schema extract/validate, migrations). The embedded
// Studio itself is configured in sanity.config.ts and served by Astro.
export default defineCliConfig({
  api: {
    projectId: process.env.PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.PUBLIC_SANITY_DATASET,
  },
});
