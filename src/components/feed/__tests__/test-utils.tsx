import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import type { ReactElement, ReactNode } from 'react';
import { vi } from 'vitest';

export function renderWithQuery(ui: ReactElement) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  const wrapper = ({ children }: { children: ReactNode }) => <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  return { client, ...render(ui, { wrapper }) };
}

/** IntersectionObserver stub; `fireIntersect()` reports every observed element as visible. */
export function installIntersectionObserver() {
  const observers: { cb: IntersectionObserverCallback; els: Element[] }[] = [];
  class IO {
    cb: IntersectionObserverCallback;
    els: Element[] = [];
    constructor(cb: IntersectionObserverCallback) {
      this.cb = cb;
      observers.push(this);
    }
    observe(el: Element) {
      this.els.push(el);
    }
    unobserve() {}
    disconnect() {
      this.els = [];
    }
    takeRecords() {
      return [];
    }
  }
  vi.stubGlobal('IntersectionObserver', IO);
  return {
    fireIntersect(filter: (el: Element) => boolean = () => true) {
      for (const o of observers) {
        const entries = o.els.filter(filter).map(
          (target) => ({ target, isIntersecting: true, intersectionRatio: 1 }) as unknown as IntersectionObserverEntry
        );
        if (entries.length) o.cb(entries, o as unknown as IntersectionObserver);
      }
    },
  };
}

export function installClipboard() {
  const writeText = vi.fn().mockResolvedValue(undefined);
  Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
  return writeText;
}
