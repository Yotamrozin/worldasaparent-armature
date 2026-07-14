// Resolve a `link` object (see studio/schemaTypes/objects/link.ts) to an href.
// Internal links can target any routed document type; the query that fetches
// a `link` must dereference `internal` to `{ _type, "slug": slug.current }`
// (a raw, un-dereferenced reference only carries `_type: "reference"` and
// can't be resolved here).
export interface SanityLink {
  linkType?: 'internal' | 'external';
  external?: string;
  internal?: { _type?: string; slug?: string };
}

// One resolver per routed document type. Extend this as more page singletons
// and collections are added.
const internalPaths: Record<string, (ref: NonNullable<SanityLink['internal']>) => string> = {
  homepage: () => '/',
  blogIndex: () => '/blog',
  about: () => '/about',
  contact: () => '/contact',
  post: (ref) => `/blog/${ref.slug ?? ''}`,
};

export function resolveHref(link?: SanityLink): string | undefined {
  if (!link) return undefined;
  if (link.linkType === 'external') return link.external;
  if (link.linkType === 'internal' && link.internal?._type) {
    return internalPaths[link.internal._type]?.(link.internal);
  }
  return undefined;
}
