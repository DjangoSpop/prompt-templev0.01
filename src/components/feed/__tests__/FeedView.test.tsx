import { act, fireEvent, screen, waitFor, within } from '@testing-library/react';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { createFeedMockState, feedDisabledHandlers, feedHandlers, type FeedMockState } from '@/mocks/feed/handlers';
import { useAuthStore } from '@/store/user';
import { clearPendingReaction, getPendingReaction, setPendingReaction } from '@/lib/feed/pending';
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

import { FeedView } from '../FeedView';

const server = setupServer();
let state: FeedMockState;
let io: ReturnType<typeof installIntersectionObserver>;

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterAll(() => server.close());
beforeEach(() => {
  state = createFeedMockState();
  server.resetHandlers(...feedHandlers(state));
  search = new URLSearchParams();
  replace.mockClear();
  io = installIntersectionObserver();
  installClipboard();
  sessionStorage.clear();
  clearPendingReaction();
  useAuthStore.setState({ isAuthenticated: false, accessToken: undefined });
});
afterEach(() => vi.unstubAllGlobals());

const cards = () => within(screen.getByRole('list', { name: 'Prompts' })).getAllByRole('article');

describe('FeedView', () => {
  it('renders 20 items, then 20 more at the sentinel', async () => {
    renderWithQuery(<FeedView />);
    await waitFor(() => expect(cards()).toHaveLength(20));
    act(() => io.fireIntersect((el) => el.getAttribute('aria-hidden') === 'true' && el.classList.contains('h-px')));
    await waitFor(() => expect(cards()).toHaveLength(40));
    expect(state.requests.at(-1)?.searchParams.get('cursor')).toBe('20');
  });

  it('syncs the tab to the URL and resets the cursor', async () => {
    const { rerender } = renderWithQuery(<FeedView />);
    await waitFor(() => expect(cards()).toHaveLength(20));
    fireEvent.click(screen.getByRole('tab', { name: /New/ }));
    expect(replace).toHaveBeenCalledWith('/feed?tab=new', { scroll: false });
    rerender(<FeedView />);
    await waitFor(() => expect(state.requests.at(-1)?.searchParams.get('tab')).toBe('new'));
    expect(state.requests.at(-1)?.searchParams.get('cursor')).toBeNull();
  });

  it('restores tab and filters from the URL', async () => {
    search = new URLSearchParams('tab=top&form=chain,system_prompt');
    renderWithQuery(<FeedView />);
    await waitFor(() => expect(state.requests.at(-1)?.searchParams.get('form')).toBe('chain,system_prompt'));
    expect(state.requests.at(-1)?.searchParams.get('tab')).toBe('top');
    await waitFor(() => expect(cards().length).toBeGreaterThan(0));
    expect(screen.getByRole('tab', { name: /Top/ })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('button', { name: /Remove filter Form: Chain/ })).toBeInTheDocument();
  });

  it('falls back to the library when the feed is disabled', async () => {
    server.resetHandlers(...feedDisabledHandlers);
    renderWithQuery(<FeedView />);
    expect(await screen.findByText('Feed coming soon.')).toBeInTheDocument();
    expect(screen.getByText('Discover library')).toBeInTheDocument();
  });

  it('shows the sign-in note and CTA on anonymous for_you', async () => {
    renderWithQuery(<FeedView />);
    await waitFor(() => expect(cards()).toHaveLength(20));
    fireEvent.click(screen.getByRole('tab', { name: /For you/ }));
    expect(await screen.findByText('Get prompts picked for you')).toBeInTheDocument();
  });

  it('shows the filtered empty state', async () => {
    state.items = [];
    search = new URLSearchParams('form=chain');
    renderWithQuery(<FeedView />);
    expect(await screen.findByText('No prompts match; clear a filter.')).toBeInTheDocument();
  });
});

describe('reactions', () => {
  it('anonymous like opens the CTA and stores the intent', async () => {
    renderWithQuery(<FeedView />);
    await waitFor(() => expect(cards()).toHaveLength(20));
    fireEvent.click(within(cards()[2]).getByRole('button', { name: /^Like/ }));
    expect(await screen.findByText('Like prompts with a free account')).toBeInTheDocument();
    expect(getPendingReaction()).toMatchObject({ slug: state.items[2].slug, kind: 'like' });
    expect(state.reactCalls).toHaveLength(0);
  });

  it('signed-in like is optimistic and confirmed once', async () => {
    useAuthStore.setState({ isAuthenticated: true, accessToken: 'token' });
    renderWithQuery(<FeedView />);
    await waitFor(() => expect(cards()).toHaveLength(20));
    const like = within(cards()[1]).getByRole('button', { name: /^Like/ });
    fireEvent.click(like);
    expect(await within(cards()[1]).findByRole('button', { name: /^Unlike/ })).toHaveAttribute('aria-pressed', 'true');
    await waitFor(() => expect(state.reactCalls).toEqual([{ slug: state.items[1].slug, kind: 'like' }]));
    expect(within(cards()[1]).getByRole('button', { name: /^Unlike \(2 likes\)/ })).toBeInTheDocument();
  });

  it('rolls back when the server rejects the reaction', async () => {
    useAuthStore.setState({ isAuthenticated: true, accessToken: 'token' });
    const { http, HttpResponse } = await import('msw');
    server.use(http.post('*/react/', () => HttpResponse.json({ detail: 'x', code: 'error' }, { status: 500 })));
    renderWithQuery(<FeedView />);
    await waitFor(() => expect(cards()).toHaveLength(20));
    fireEvent.click(within(cards()[1]).getByRole('button', { name: /^Like/ }));
    await waitFor(() => expect(within(cards()[1]).getByRole('button', { name: /^Like \(1 likes\)/ })).toHaveAttribute('aria-pressed', 'false'));
  });

  it('replays the pending reaction once after sign-in', async () => {
    setPendingReaction({ slug: SIXTY_SLUG(3), kind: 'save' });
    useAuthStore.setState({ isAuthenticated: true, accessToken: 'token' });
    renderWithQuery(<FeedView />);
    await waitFor(() => expect(state.reactCalls).toEqual([{ slug: SIXTY_SLUG(3), kind: 'save' }]));
    expect(getPendingReaction()).toBeNull();
  });

  it('copy fetches the prompt, writes the clipboard and records one copy', async () => {
    const writeText = installClipboard();
    renderWithQuery(<FeedView />);
    await waitFor(() => expect(cards()).toHaveLength(20));
    fireEvent.click(within(cards()[0]).getByRole('button', { name: 'Copy prompt' }));
    await waitFor(() => expect(writeText).toHaveBeenCalledWith(expect.stringContaining('You are a reviewer')));
    await waitFor(() => expect(state.copyCalls).toHaveLength(1));
  });
});

function SIXTY_SLUG(i: number) {
  return state.items[i].slug;
}
