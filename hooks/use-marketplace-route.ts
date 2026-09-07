'use client';
import { useCallback, useSyncExternalStore } from 'react';
export interface MarketplaceRoute {
  product: string;
  variant: string;
  plan: string;
}
function subscribe(callback: () => void) {
  window.addEventListener('popstate', callback);
  window.addEventListener('marketplace:navigate', callback);
  return () => {
    window.removeEventListener('popstate', callback);
    window.removeEventListener('marketplace:navigate', callback);
  };
}
const snapshot = () => window.location.search;
const serverSnapshot = () => '';
export function useMarketplaceRoute() {
  const search = useSyncExternalStore(subscribe, snapshot, serverSnapshot);
  const params = new URLSearchParams(search);
  const route = {
    product: params.get('product') ?? '',
    variant: params.get('variant') ?? '',
    plan: params.get('plan') ?? '',
  };
  const navigate = useCallback((next: MarketplaceRoute, replace = false) => {
    const url = new URL(window.location.href);
    for (const [key, value] of Object.entries(next)) {
      if (value) url.searchParams.set(key, value);
      else url.searchParams.delete(key);
    }
    url.hash = '';
    window.history[replace ? 'replaceState' : 'pushState']({}, '', url);
    window.dispatchEvent(new Event('marketplace:navigate'));
    if (!replace) window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);
  return { route, navigate };
}
