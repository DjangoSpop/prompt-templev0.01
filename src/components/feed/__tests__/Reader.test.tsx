/**
 * Sprint 09 — inline reader (R1, R2, R4) over the §7 fixture through MSW.
 * framer-motion is stubbed so open/close are synchronous in jsdom.
 */
import { act, fireEvent, screen, waitFor, within } from '@testing-library/react';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import { renderFilled } from '@/lib/feed/render';
import { createFeedMockState, feedHandlers, type FeedMockState } from '@/mocks/feed/handlers';
import { firstOfKind, itemsOfKind, SPRINT09_ITEMS, SPRINT09_RANGES } from '@/mocks/feed/sprint09';
import { useAuthStore } from '@/store/user';
import { installClipboard, installIntersectionObserver, renderWithQuery } from './test-utils';

let search = new URLSearchParams();
const replace = vi.fn((url: string) => {
  search = new URLSearchParams(url.split('?')[1] ?? '');
});
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace, push: vi.fn() }),
  usePathname: () => '/feed',
  useSearchParams: () => search,
}));
vi.mock('next/dynamic', () => ({ default: () => () => <div>Discover library</div> }));
vi.mock('@/lib/analytics/trackEvent', () => ({ trackEvent: vi.fn() }));
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock('framer-motion', async () => {
  const React = await import('react');
  const strip = new Set(['initial', 'animate', 'exit', 'transition', 'onAnimationStart', 'onAnimationComplete', 'layout']);
  const div = React.forwardRef<HTMLDivElement, Record<string, unknown>>((props, ref) => {
    const rest: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(props)) if (!strip.has(k)) rest[k] = v;
    return React.createElement('div', { ref, ...rest });
  });
  div.displayName = 'motion.div';
  return {
    motion: { div },
    AnimatePresence: ({ children }: { children: React.ReactNode }) => React.createElement(React.Fragment, null, children),
    useReducedMotion: () => false,
  };
});

import { trackEvent } from '@/lib/analytics/trackEvent';
import { FeedView } from '../FeedView';
import { detectSwipe, readerTransition } from '../ReaderRegion';

const server = setupServer();
let state: FeedMockState;
let io: ReturnType<typeof installIntersectionObserver>;
let writeText: Mock;

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterAll(() => server.close());
beforeEach(() => {
  state = createFeedMockState(SPRINT09_ITEMS);
  server.resetHandlers(...feedHandlers(state));
  search = new URLSearchParams();
  replace.mockClear();
  io = installIntersectionObserver();
  writeText = installClipboard();
  sessionStorage.clear();
  (window.localStorage.getItem as Mock).mockReset();
  window.scrollBy = vi.fn();
  window.history.replaceState(null, '', '/feed');
  useAuthStore.setState({ isAuthenticated: false, accessToken: undefined });
});
afterEach(() => vi.unstubAllGlobals());

const cards = () => within(screen.getByRole('list', { name: 'Prompts' })).getAllByRole('article');
const regions = () => screen.queryAllByTestId('reader-region');
const titleOf = (i: number) => String(SPRINT09_ITEMS[i].title);
const slugOf = (i: number) => String(SPRINT09_ITEMS[i].slug);
const urlSlug = () => new URLSearchParams(window.location.search).get('p');

async function renderFeed() {
  const utils = renderWithQuery(<FeedView />);
  await waitFor(() => expect(cards()).toHaveLength(20));
  return utils;
}

function openCard(i: number) {
  fireEvent.click(screen.getByRole('button', { name: titleOf(i) }));
}

async function loadNextPage() {
  await act(async () => io.fireIntersect((el) => el.getAttribute('aria-hidden') === 'true' && el.classList.contains('h-px')));
}

describe('reader — open, close, focus', () => {
  it('opens in place with aria-expanded, focuses the region and sets ?p=', async () => {
    await renderFeed();
    const toggle = screen.getByRole('button', { name: titleOf(0) });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(toggle);
    const region = screen.getByRole('region', { name: titleOf(0) });
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(toggle).toHaveAttribute('aria-controls', region.id);
    expect(document.activeElement).toBe(region);
    expect(urlSlug()).toBe(slugOf(0));
    expect(screen.getByTestId('prompt-text')).toHaveTextContent((SPRINT09_ITEMS[0].text as string).slice(0, 20));
    expect(trackEvent).toHaveBeenCalledWith('reader_opened', expect.objectContaining({ slug: slugOf(0), from: 'tap' }));
  });

  it('Esc closes, returns focus to the toggle and clears ?p=', async () => {
    await renderFeed();
    openCard(1);
    expect(regions()).toHaveLength(1);
    fireEvent.keyDown(document, { key: 'Escape' });
    await waitFor(() => expect(regions()).toHaveLength(0));
    await waitFor(() => expect(urlSlug()).toBeNull());
    expect(document.activeElement).toBe(screen.getByRole('button', { name: titleOf(1) }));
    expect(trackEvent).toHaveBeenCalledWith('reader_closed', expect.objectContaining({ reason: 'esc' }));
  });

  it('only one reader is open by default', async () => {
    await renderFeed();
    openCard(0);
    openCard(1);
    expect(regions()).toHaveLength(1);
    expect(screen.getByRole('region', { name: titleOf(1) })).toBeInTheDocument();
    expect(trackEvent).toHaveBeenCalledWith('reader_closed', expect.objectContaining({ slug: slugOf(0), reason: 'replaced' }));
  });

  it('"Keep prompts open" (persisted setting) allows several', async () => {
    (window.localStorage.getItem as Mock).mockImplementation((k: string) =>
      k === 'pt.reader.settings' ? JSON.stringify({ keepOpen: true, softCollapse: false }) : null
    );
    await renderFeed();
    openCard(2);
    openCard(3);
    expect(regions()).toHaveLength(2);
    expect(urlSlug()).toBe(slugOf(3));
  });

  it('the back button closes the reader and keeps the feed', async () => {
    await renderFeed();
    openCard(0);
    expect(urlSlug()).toBe(slugOf(0));
    await act(async () => {
      window.history.back();
    });
    await waitFor(() => expect(regions()).toHaveLength(0));
    expect(cards()).toHaveLength(20);
  });

  it('a tab change closes the reader', async () => {
    const { rerender } = await renderFeed();
    openCard(0);
    fireEvent.click(screen.getByRole('tab', { name: /New/ }));
    rerender(<FeedView />);
    await waitFor(() => expect(regions()).toHaveLength(0));
  });
});

describe('reader — continue reading', () => {
  it('j / k move to the neighbour and update the URL; link cards are skipped', async () => {
    await renderFeed();
    openCard(0);
    fireEvent.keyDown(document, { key: 'j' });
    expect(screen.getByRole('region', { name: titleOf(1) })).toBeInTheDocument();
    expect(urlSlug()).toBe(slugOf(1));
    fireEvent.keyDown(document, { key: 'k' });
    expect(screen.getByRole('region', { name: titleOf(0) })).toBeInTheDocument();
    expect(trackEvent).toHaveBeenCalledWith('reader_next', expect.objectContaining({ method: 'j' }));

    // last readable of page 1 is #16; 17–19 are link cards; j fetches page 2 and opens #20
    openCard(SPRINT09_RANGES.short[1]);
    fireEvent.keyDown(document, { key: 'j' });
    await waitFor(() => expect(screen.getByRole('region', { name: titleOf(20) })).toBeInTheDocument());
    expect(urlSlug()).toBe(slugOf(20));
  });

  it('the arrows in the sticky bar move too', async () => {
    await renderFeed();
    openCard(2);
    fireEvent.click(screen.getByRole('button', { name: 'Next prompt' }));
    expect(screen.getByRole('region', { name: titleOf(3) })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Previous prompt' }));
    expect(screen.getByRole('region', { name: titleOf(2) })).toBeInTheDocument();
  });

  it('swipe detection: ≥ 60 px horizontal, ≤ 40 px drift', () => {
    expect(detectSwipe(-70, 10)).toBe(1);
    expect(detectSwipe(70, -10)).toBe(-1);
    expect(detectSwipe(-30, 0)).toBe(0);
    expect(detectSwipe(-90, 55)).toBe(0);
  });

  it('reduced motion makes both durations 0 ms', () => {
    expect(readerTransition(true, false).duration).toBeCloseTo(0.22);
    expect(readerTransition(false, false).duration).toBeCloseTo(0.16);
    expect(readerTransition(true, true).duration).toBe(0);
    expect(readerTransition(false, true).duration).toBe(0);
  });

  it('link cards have no reader', async () => {
    await renderFeed();
    const link = firstOfKind('link');
    expect(screen.queryByRole('button', { name: String(link.title) })).toBeNull();
    expect(screen.getByRole('link', { name: String(link.title) })).toBeInTheDocument();
  });
});

describe('reader — zero fetch (R1)', () => {
  it('opening an item from page 2 makes no network call', async () => {
    await renderFeed();
    await loadNextPage();
    await waitFor(() => expect(cards()).toHaveLength(40));
    const requestsBefore = state.requests.length;
    openCard(25);
    expect(screen.getByRole('region', { name: titleOf(25) })).toBeInTheDocument();
    expect(screen.getByTestId('prompt-text')).toHaveTextContent('Role');
    expect(state.promptRequests).toEqual([]);
    expect(state.requests).toHaveLength(requestsBefore);
  });

  it('a deep link to a slug outside the loaded pages fetches it once and pins it open', async () => {
    const target = 50; // page 3
    search = new URLSearchParams(`p=${encodeURIComponent(slugOf(target))}`);
    renderWithQuery(<FeedView />);
    await waitFor(() => expect(screen.getByRole('region', { name: titleOf(target) })).toBeInTheDocument());
    expect(state.promptRequests).toEqual([slugOf(target)]);
    const list = screen.getByRole('list', { name: 'Prompts' });
    const first = list.querySelector('li');
    expect(first).toHaveAttribute('data-pinned', 'true');
    expect(within(first as HTMLElement).getByRole('button', { name: titleOf(target) })).toHaveAttribute('aria-expanded', 'true');
    expect(trackEvent).toHaveBeenCalledWith('reader_opened', expect.objectContaining({ from: 'deeplink' }));
  });

  it('a cut text (text_truncated) loads its tail once on open', async () => {
    const item = firstOfKind('truncated');
    state = createFeedMockState([item, ...SPRINT09_ITEMS.slice(0, 5)]);
    server.resetHandlers(...feedHandlers(state));
    renderWithQuery(<FeedView />);
    await waitFor(() => expect(cards()).toHaveLength(6));
    fireEvent.click(screen.getByRole('button', { name: String(item.title) }));
    await waitFor(() => expect(state.promptRequests).toEqual([String(item.slug)]));
  });
});

describe('reader — copy and views (R3, R4)', () => {
  it('Copy writes the plain text byte for byte and records one copy', async () => {
    await renderFeed();
    await loadNextPage();
    await waitFor(() => expect(cards()).toHaveLength(40));
    openCard(20);
    fireEvent.click(screen.getByTestId('reader-copy'));
    await waitFor(() => expect(writeText).toHaveBeenCalledWith(SPRINT09_ITEMS[20].text));
    await waitFor(() => expect(state.copyCalls).toHaveLength(1));
    expect(screen.getByTestId('reader-copy')).toHaveTextContent('Copied');
    expect(trackEvent).toHaveBeenCalledWith('prompt_copied', expect.objectContaining({ view: 'full' }));
  });

  it('the c key copies from the active reader', async () => {
    await renderFeed();
    openCard(3);
    fireEvent.keyDown(document, { key: 'c' });
    await waitFor(() => expect(writeText).toHaveBeenCalledWith(SPRINT09_ITEMS[3].text));
  });

  it('Variables view: filling two and "Copy filled" matches renderFilled', async () => {
    const item = firstOfKind('template_vars');
    state = createFeedMockState([item, ...itemsOfKind('short').slice(0, 3)]);
    server.resetHandlers(...feedHandlers(state));
    renderWithQuery(<FeedView />);
    await waitFor(() => expect(cards()).toHaveLength(4));
    fireEvent.click(screen.getByRole('button', { name: String(item.title) }));
    fireEvent.click(screen.getByRole('tab', { name: 'Variables' }));
    const inputs = within(screen.getByTestId('reader-variables')).getAllByRole('textbox');
    const views = item.views as { variables: { name: string }[] };
    const names = views.variables.map((v) => v.name);
    fireEvent.change(inputs[0], { target: { value: 'Ada' } });
    fireEvent.change(inputs[1], { target: { value: 'tests' } });
    await waitFor(() => expect(screen.getByTestId('reader-copy')).toHaveTextContent('Copy filled'));
    fireEvent.click(screen.getByTestId('reader-copy'));
    const expected = renderFilled(item.text as string, names, { [names[0]]: 'Ada', [names[1]]: 'tests' }).text;
    await waitFor(() => expect(writeText).toHaveBeenCalledWith(expected));
    expect(expected).not.toBe(item.text);
    expect(trackEvent).toHaveBeenCalledWith('prompt_copied', expect.objectContaining({ view: 'filled' }));
  });

  it('Outline and Steps come from the payload; the switch is hidden when views is null', async () => {
    const chain = firstOfKind('chain');
    const noViews = firstOfKind('no_views');
    state = createFeedMockState([chain, noViews]);
    server.resetHandlers(...feedHandlers(state));
    renderWithQuery(<FeedView />);
    await waitFor(() => expect(cards()).toHaveLength(2));
    fireEvent.click(screen.getByRole('button', { name: String(chain.title) }));
    const tabs = screen.getByRole('tablist', { name: 'View' });
    fireEvent.click(within(tabs).getByRole('tab', { name: 'Steps' }));
    expect(within(screen.getByTestId('reader-steps')).getAllByRole('listitem')).toHaveLength(5);
    fireEvent.click(within(tabs).getByRole('tab', { name: 'Outline' }));
    expect(screen.getByTestId('reader-outline')).toBeInTheDocument();
    expect(trackEvent).toHaveBeenCalledWith('reader_view_switched', expect.objectContaining({ view: 'outline' }));

    fireEvent.click(screen.getByRole('button', { name: String(noViews.title) }));
    expect(screen.queryByRole('tablist', { name: 'View' })).toBeNull();
    expect(screen.getByTestId('prompt-text')).toBeInTheDocument();
  });

  it('Arabic prompts render right-to-left', async () => {
    const ar = firstOfKind('arabic');
    state = createFeedMockState([ar]);
    server.resetHandlers(...feedHandlers(state));
    renderWithQuery(<FeedView />);
    await waitFor(() => expect(cards()).toHaveLength(1));
    fireEvent.click(screen.getByRole('button', { name: String(ar.title) }));
    expect(screen.getByTestId('prompt-text')).toHaveAttribute('dir', 'rtl');
  });
});
