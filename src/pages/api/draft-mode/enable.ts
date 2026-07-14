import type { APIRoute } from 'astro';
import { validatePreviewUrl } from '@sanity/preview-url-secret';
import { perspectiveCookieName } from '@sanity/preview-url-secret/constants';
import { sanityClient } from 'sanity:client';

// On-demand: reads the request and sets a cookie, so it can't be prerendered.
export const prerender = false;

// The Presentation Tool calls this route (with a signed secret) to turn on draft
// preview. We validate the signature, then set the perspective cookie that
// loadQuery reads to switch to draft content.
export const GET: APIRoute = async ({ request, cookies, redirect }) => {
  const token = import.meta.env.SANITY_API_READ_TOKEN;
  if (!token) {
    return new Response('Server misconfigured: missing SANITY_API_READ_TOKEN', {
      status: 500,
    });
  }

  const clientWithToken = sanityClient.withConfig({ token });
  const { isValid, redirectTo = '/', studioPreviewPerspective } =
    await validatePreviewUrl(clientWithToken, request.url);

  if (!isValid) {
    return new Response('Invalid preview URL', { status: 401 });
  }

  cookies.set(perspectiveCookieName, studioPreviewPerspective ?? 'drafts', {
    httpOnly: false,
    sameSite: 'none',
    secure: true,
    path: '/',
  });

  return redirect(redirectTo, 307);
};
