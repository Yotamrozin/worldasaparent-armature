import type { AstroCookies } from 'astro';
import { perspectiveCookieName } from '@sanity/preview-url-secret/constants';

// The Presentation Tool's draft-mode enable route sets this cookie. Its presence
// means the current request should preview drafts. Pass the returned value to
// loadQuery, and use Boolean(value) to toggle the visual-editing overlays.
export function getPerspectiveCookie(cookies: AstroCookies): string | undefined {
  return cookies.get(perspectiveCookieName)?.value ?? undefined;
}
