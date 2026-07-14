import type { SanityImageSource } from '@sanity/image-url/lib/types/types';

// Shared GROQ projection + type for post "cards": the compact shape reused by
// every surface that lists posts (the /blog grid, the postList block, and the
// postFeatured block), so a field added to one card view lands in all of them.
export const postCardProjection = `{
  _id,
  title,
  "slug": slug.current,
  excerpt,
  mainImage,
  publishedAt
}`;

export interface PostCardData {
  _id: string;
  title?: string;
  slug?: string;
  excerpt?: string;
  mainImage?: SanityImageSource & { alt?: string };
  publishedAt?: string;
}
