import { fireEvent, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { makeDetail, makeItem } from '@/mocks/feed/factory';
import { feedPromptDetailSchema } from '@/lib/feed/types';
import { installClipboard, installIntersectionObserver, renderWithQuery } from './test-utils';

let search = new URLSearchParams();
const replace = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace, push: vi.fn() }),
  usePathname: () => '/prompts/a/b/c',
  useSearchParams: () => search,
}));
vi.mock('@/lib/analytics/trackEvent', () => ({ trackEvent: vi.fn() }));
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock('@/lib/feed/api', async (orig) => ({
  ...(await orig<typeof import('@/lib/feed/api')>()),
  getPrompt: vi.fn(() => new Promise(() => {})), // keep the initial data
  recordCopy: vi.fn(),
}));

import { availableViews, defaultView, PromptPageView } from '../PromptPageView';

const VIEWS = {
  outline: [
    { title: 'Role', body: 'You review code.' },
    { title: 'Rules', body: 'Be strict.' },
  ],
  variables: [
    { name: 'name', hint: 'reviewer for … at', occurrences: 1, default: null },
    { name: 'company', hint: null, occurrences: 1, default: null },
  ],
  steps: [],
  compact: 'You review code.',
};

function detail(form: string, views: unknown = VIEWS) {
  return feedPromptDetailSchema.parse(makeDetail(makeItem(1, { form }), { views }));
}

beforeEach(() => {
  search = new URLSearchParams();
  replace.mockClear();
  installIntersectionObserver();
  sessionStorage.clear();
});

describe('view rules', () => {
  it('defaults to outline for structured forms, full otherwise', () => {
    expect(defaultView(detail('system_prompt'))).toBe('outline');
    expect(defaultView(detail('short'))).toBe('full');
  });

  it('offers steps only for chains, and no views when the backend sends none', () => {
    const steps = { ...VIEWS, steps: [{ n: 1, text: 'Plan' }] };
    expect(availableViews(detail('chain', steps))).toEqual(['outline', 'full', 'variables', 'steps']);
    expect(availableViews(detail('long_form', steps))).toEqual(['outline', 'full', 'variables']);
    expect(availableViews(detail('system_prompt', null))).toEqual([]);
  });
});

describe('PromptPageView', () => {
  it('views:null degrades to the full text without a switcher', () => {
    renderWithQuery(<PromptPageView slug="a/b/c" initial={detail('system_prompt', null)} />);
    expect(screen.queryByRole('tablist', { name: 'View' })).toBeNull();
    expect(screen.getByText(/You are a reviewer for \{\{name\}\}/)).toBeInTheDocument();
  });

  it('renders the outline by default and switches view via the URL', () => {
    renderWithQuery(<PromptPageView slug="a/b/c" initial={detail('system_prompt')} />);
    expect(screen.getByRole('tab', { name: 'Outline' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getAllByText('Rules').length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole('tab', { name: 'Variables' }));
    expect(replace).toHaveBeenCalledWith('/prompts/a/b/c?view=variables', { scroll: false });
  });

  it('variables form fills the preview and copies the filled prompt', async () => {
    const writeText = installClipboard();
    search = new URLSearchParams('view=variables');
    const prompt = detail('template_vars');
    renderWithQuery(<PromptPageView slug={prompt.slug} initial={prompt} />);
    fireEvent.change(screen.getByLabelText('name'), { target: { value: 'Ana' } });
    fireEvent.change(screen.getByLabelText('company'), { target: { value: 'Acme' } });
    expect(screen.getByText(/You are a reviewer for Ana at Acme\./)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Copy filled prompt' }));
    await vi.waitFor(() => expect(writeText).toHaveBeenCalledWith(expect.stringContaining('reviewer for Ana at Acme.')));
    expect(JSON.parse(sessionStorage.getItem(`pt.feed.vars.${prompt.slug}`) ?? '{}')).toEqual({ name: 'Ana', company: 'Acme' });
  });

  it('shows the source block', () => {
    renderWithQuery(<PromptPageView slug="a/b/c" initial={detail('short', null)} />);
    expect(screen.getByText('acme/prompts')).toBeInTheDocument();
    expect(screen.getByText('License: MIT')).toBeInTheDocument();
  });
});
