import type { ClientPerspective, QueryParams } from '@sanity/client';
import { sanityClient } from 'sanity:client';

// Server-only read token. Required only in draft mode (previewing drafts); the
// published path never needs it. No PUBLIC_ prefix — it must never reach the browser.
const token = import.meta.env.SANITY_API_READ_TOKEN;

// The Studio is embedded at /admin on the same origin, so stega click-to-edit
// links resolve there (a relative path is correct for a same-origin Studio).
const STUDIO_URL = '/admin';

export interface LoadQueryResult<T> {
  data: T;
  sourceMap: unknown;
  draftMode: boolean;
}

// Draft-aware fetch. When a perspective cookie is present (set by the
// Presentation Tool's draft-mode route) it reads drafts with the token, enables
// stega encoding + a source map for the visual-editing overlays. Otherwise it
// reads published content with no token and no stega.
export async function loadQuery<T = unknown>({
  query,
  params = {},
  perspective,
}: {
  query: string;
  params?: QueryParams;
  perspective?: string;
}): Promise<LoadQueryResult<T>> {
  const draftMode = Boolean(perspective);

  if (draftMode && !token) {
    throw new Error(
      'SANITY_API_READ_TOKEN is required for draft mode / visual editing. ' +
        'Add it to .env (server-only, no PUBLIC_ prefix).',
    );
  }

  const client = draftMode
    ? sanityClient.withConfig({
        token,
        useCdn: false,
        perspective: parsePerspective(perspective) ?? 'drafts',
        stega: { enabled: true, studioUrl: STUDIO_URL },
      })
    : sanityClient;

  const { result, resultSourceMap } = await client.fetch<T>(query, params, {
    filterResponse: false,
    resultSourceMap: draftMode ? 'withKeyArraySelector' : false,
  });

  return { data: result, sourceMap: resultSourceMap ?? null, draftMode };
}

// The cookie value is usually a plain perspective ("drafts") but can be a JSON
// array for release-based perspectives — parse both.
function parsePerspective(raw?: string): ClientPerspective | undefined {
  if (!raw) return undefined;
  const decoded = decodeURIComponent(raw);
  if (decoded.startsWith('[')) {
    try {
      return JSON.parse(decoded) as ClientPerspective;
    } catch {
      return undefined;
    }
  }
  return decoded as ClientPerspective;
}
