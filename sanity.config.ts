import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { presentationTool } from 'sanity/presentation';
import { visionTool } from '@sanity/vision';
import { schemaTypes } from './studio/schemaTypes';
import { resolve } from './studio/presentation/locations';

// Studio config for the Studio embedded at /admin (see astro.config.mjs).
// Project credentials come from environment variables so they stay out of source.
// Read from import.meta.env (Astro/Vite serves the embedded Studio) with a
// process.env fallback so the Sanity CLI (Node) can also load this config.
const projectId =
  import.meta.env?.PUBLIC_SANITY_PROJECT_ID ?? process.env.PUBLIC_SANITY_PROJECT_ID;
const dataset =
  import.meta.env?.PUBLIC_SANITY_DATASET ?? process.env.PUBLIC_SANITY_DATASET;

// Singleton document types: there must be exactly one of each (see
// SCHEMA-CONVENTIONS.md). We pin each to a fixed, readable document id and strip
// every "create another" surface, because Sanity otherwise treats any document
// type as a collection an editor can add to — which would let a client create a
// second homepage. Each id here is also the id the site's queries should read.
const singletonTypes = new Set(['siteSettings', 'homepage', 'blogIndex', 'about', 'contact']);
// The only document actions a singleton keeps: no duplicate, no delete (both
// would break the "exactly one" guarantee).
const singletonActions = new Set(['publish', 'discardChanges', 'restore']);

export default defineConfig({
  name: 'default',
  title: 'Armature',

  projectId,
  dataset,

  plugins: [
    structureTool({
      // Pin singletons to a single fixed document and keep them out of the
      // default document-type list, so there is no list view with a
      // "Create new" button for them.
      structure: (S) =>
        S.list()
          .title('Content')
          .items([
            S.listItem()
              .title('Homepage')
              .id('homepage')
              .child(S.document().schemaType('homepage').documentId('homepage')),
            S.listItem()
              .title('Blog')
              .id('blogIndex')
              .child(S.document().schemaType('blogIndex').documentId('blogIndex')),
            S.listItem()
              .title('About')
              .id('about')
              .child(S.document().schemaType('about').documentId('about')),
            S.listItem()
              .title('Contact')
              .id('contact')
              .child(S.document().schemaType('contact').documentId('contact')),
            S.listItem()
              .title('Site Settings')
              .id('siteSettings')
              .child(
                S.document().schemaType('siteSettings').documentId('siteSettings'),
              ),
            S.divider(),
            // Everything else (collections, added later) lists normally.
            ...S.documentTypeListItems().filter(
              (item) => !singletonTypes.has(item.getId() ?? ''),
            ),
          ]),
    }),
    // Click-to-edit visual editing. The preview site is same-origin (the Studio
    // is embedded at /admin), so `origin` is omitted and defaults to the current
    // origin — localhost in dev, the deployed domain in production.
    presentationTool({
      resolve,
      previewUrl: {
        preview: '/',
        previewMode: { enable: '/api/draft-mode/enable' },
      },
    }),
    visionTool(),
  ],

  schema: {
    types: schemaTypes,
  },

  document: {
    // Remove singletons from the global "＋ Create" menu.
    newDocumentOptions: (prev, { creationContext }) =>
      creationContext.type === 'global'
        ? prev.filter((item) => !singletonTypes.has(item.templateId))
        : prev,
    // For singletons, drop actions that would create or remove copies.
    actions: (prev, { schemaType }) =>
      singletonTypes.has(schemaType)
        ? prev.filter(({ action }) => action && singletonActions.has(action))
        : prev,
  },
});
