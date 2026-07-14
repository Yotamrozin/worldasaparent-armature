"use client";

// Replaces @sanity/astro's <VisualEditing> for this page specifically, so
// that `usePresentationQuery` (live content streaming — see
// https://github.com/sanity-io/visual-editing) shares the same comlink
// connection/module scope as the overlay UI. @sanity/astro only exports the
// wrapped .astro component, not its inner React piece, so the click-to-edit
// history-sync logic below is ported from its source (MIT licensed) rather
// than reimplemented from scratch — only the `refresh` behavior differs.
//
// Without this, editing a field still worked (via the reload-based refresh
// @sanity/astro provides by default), but every keystroke's worth of change
// only appeared after a full page reload. With a live query connected, text/
// image edits stream in and re-render instantly; `refresh` (full reload)
// still exists as a fallback for structural changes (e.g. adding a whole new
// section) that a query-diff alone wouldn't necessarily catch cleanly.

import { useEffect, useMemo, useRef } from 'react';
import {
  VisualEditing,
  usePresentationQuery,
  type HistoryAdapter,
  type HistoryAdapterNavigate,
  type HistoryUpdate,
} from '@sanity/visual-editing/react';
import App, { type AppProps } from './App';
import { resolveHomepageProps, HOMEPAGE_QUERY, type HomepageDoc } from './resolveHomepageProps';
import { clientUrlFor } from './clientImageUrl';

function getPresentationUrl(location: Pick<Location, 'pathname' | 'search' | 'hash'>): string {
  return `${location.pathname}${location.search}${location.hash}`;
}

function shouldPublishUrl(nextUrl: string, previousUrl: string): boolean {
  return nextUrl !== previousUrl;
}

function applyHistoryUpdate(
  update: Pick<HistoryUpdate, 'type' | 'url'>,
  currentHref: string,
  navigate: { assign: (url: string) => void; replace: (url: string) => void; back: () => void },
): void {
  switch (update.type) {
    case 'push':
      if (currentHref !== update.url) navigate.assign(update.url);
      return;
    case 'replace':
      if (currentHref !== update.url) navigate.replace(update.url);
      return;
    case 'pop':
      navigate.back();
      return;
    default:
      return;
  }
}

function useHistoryAdapter(): HistoryAdapter {
  const navigateRef = useRef<HistoryAdapterNavigate | undefined>(undefined);
  const lastUrlRef = useRef('');
  const optimisticUrlRef = useRef<string | undefined>(undefined);
  const optimisticUntilRef = useRef(0);
  const clearNavigateTimeoutRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const publishUrl = (url: string, force = false) => {
      const navigate = navigateRef.current;
      if (!navigate) return;
      const now = Date.now();
      const optimisticUrl = optimisticUrlRef.current;
      const optimisticWindowOpen = now < optimisticUntilRef.current;
      if (!force && optimisticUrl && optimisticWindowOpen && url !== optimisticUrl) return;
      if (optimisticUrl && url === optimisticUrl) {
        optimisticUrlRef.current = undefined;
        optimisticUntilRef.current = 0;
      }
      if (!force && !shouldPublishUrl(url, lastUrlRef.current)) return;
      lastUrlRef.current = url;
      navigate({ type: 'push', title: document.title, url });
    };
    const syncCurrentUrl = () => publishUrl(getPresentationUrl(window.location));
    const publishClickedLink = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
      const eventTarget = event.target;
      if (!(eventTarget instanceof Element)) return;
      const anchor = eventTarget.closest('a[href]');
      if (!(anchor instanceof HTMLAnchorElement)) return;
      if (anchor.target && anchor.target !== '_self') return;
      let targetUrl: URL;
      try {
        targetUrl = new URL(anchor.href, window.location.href);
      } catch {
        return;
      }
      if (targetUrl.origin !== window.location.origin) return;
      const url = `${targetUrl.pathname}${targetUrl.search}${targetUrl.hash}`;
      optimisticUrlRef.current = url;
      optimisticUntilRef.current = Date.now() + 1500;
      publishUrl(url, true);
    };

    syncCurrentUrl();
    window.addEventListener('popstate', syncCurrentUrl);
    window.addEventListener('hashchange', syncCurrentUrl);
    document.addEventListener('click', publishClickedLink, true);
    const nativePushState = window.history.pushState;
    const nativeReplaceState = window.history.replaceState;
    window.history.pushState = function (...args: Parameters<typeof nativePushState>) {
      nativePushState.apply(window.history, args);
      syncCurrentUrl();
    };
    window.history.replaceState = function (...args: Parameters<typeof nativeReplaceState>) {
      nativeReplaceState.apply(window.history, args);
      syncCurrentUrl();
    };

    return () => {
      window.removeEventListener('popstate', syncCurrentUrl);
      window.removeEventListener('hashchange', syncCurrentUrl);
      document.removeEventListener('click', publishClickedLink, true);
      window.history.pushState = nativePushState;
      window.history.replaceState = nativeReplaceState;
    };
  }, []);

  return useMemo<HistoryAdapter>(
    () => ({
      subscribe: (_navigate) => {
        window.clearTimeout(clearNavigateTimeoutRef.current);
        navigateRef.current = _navigate;
        lastUrlRef.current = getPresentationUrl(window.location);
        return () => {
          clearNavigateTimeoutRef.current = window.setTimeout(() => {
            if (navigateRef.current === _navigate) navigateRef.current = undefined;
          }, 200);
        };
      },
      update: (update) => {
        applyHistoryUpdate(update, window.location.href, {
          assign: (url) => window.location.assign(url),
          replace: (url) => window.location.replace(url),
          back: () => window.history.back(),
        });
      },
    }),
    [],
  );
}

interface Props {
  initialProps: AppProps;
  enabled: boolean;
}

export default function LiveHomepage({ initialProps, enabled }: Props) {
  const history = useHistoryAdapter();
  const presentation = usePresentationQuery({ query: HOMEPAGE_QUERY });

  const liveProps = useMemo(() => {
    if (!presentation.data) return null;
    return resolveHomepageProps(presentation.data as HomepageDoc, (image, opts) => {
      let builder = clientUrlFor(image).width(opts.width).auto('format');
      if (opts.height) builder = builder.height(opts.height).fit('crop');
      return builder.url();
    });
  }, [presentation.data]);

  return (
    <>
      <App {...(liveProps ?? initialProps)} />
      {enabled && (
        <VisualEditing
          portal
          history={history}
          refresh={() => {
            return new Promise<void>((resolve) => {
              window.location.reload();
              resolve();
            });
          }}
        />
      )}
    </>
  );
}
