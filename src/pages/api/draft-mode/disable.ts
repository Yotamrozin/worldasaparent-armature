import type { APIRoute } from 'astro';
import { perspectiveCookieName } from '@sanity/preview-url-secret/constants';

export const prerender = false;

// Clears the draft-mode cookie, returning the visitor to published content.
export const GET: APIRoute = async ({ cookies, redirect }) => {
  cookies.delete(perspectiveCookieName, { path: '/' });
  return redirect('/', 307);
};
