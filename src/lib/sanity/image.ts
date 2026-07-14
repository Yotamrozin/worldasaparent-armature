import imageUrlBuilder from '@sanity/image-url';
import type { SanityImageSource } from '@sanity/image-url/lib/types/types';
import { stegaClean } from '@sanity/client/stega';
import { sanityClient } from 'sanity:client';

// Build URLs for Sanity image assets. Wraps the shared client so projectId and
// dataset come from one place (the @sanity/astro integration config).
const builder = imageUrlBuilder(sanityClient);

// stegaClean strips stega-encoded invisible characters from the source before
// building a URL. In draft mode fields carry stega metadata for click-to-edit;
// left in an image ref it would corrupt the generated asset URL.
export function urlFor(source: SanityImageSource) {
  return builder.image(stegaClean(source));
}
