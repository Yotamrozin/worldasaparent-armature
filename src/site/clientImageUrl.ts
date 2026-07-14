// Lightweight client-side image URL builder for live Presentation updates
// (see LiveHomepage.tsx). Deliberately avoids the `sanity:client` virtual
// module — this needs to run in a browser bundle, and project ID/dataset are
// public values safe to embed there (same ones already exposed via
// PUBLIC_-prefixed env vars), so a plain @sanity/image-url builder configured
// directly is simpler and doesn't depend on how that virtual module resolves
// outside a server context.
import imageUrlBuilder from '@sanity/image-url';
import type { SanityImageSource } from '@sanity/image-url/lib/types/types';
import { stegaClean } from '@sanity/client/stega';

const builder = imageUrlBuilder({
  projectId: import.meta.env.PUBLIC_SANITY_PROJECT_ID,
  dataset: import.meta.env.PUBLIC_SANITY_DATASET,
});

export function clientUrlFor(source: SanityImageSource) {
  return builder.image(stegaClean(source));
}
