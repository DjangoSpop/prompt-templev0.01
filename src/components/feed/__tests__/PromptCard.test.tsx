import { fireEvent, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { makeItem } from '@/mocks/feed/factory';
import { FORM_LABELS, PROMPT_FORMS, feedItemSchema } from '@/lib/feed/types';
import { useAuthStore } from '@/store/user';
import { installIntersectionObserver, renderWithQuery } from './test-utils';

vi.mock('@/lib/analytics/trackEvent', () => ({ trackEvent: vi.fn() }));
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

import { PromptCard } from '../PromptCard';

const card = (raw: Record<string, unknown>, onRequireAuth = vi.fn()) =>
  renderWithQuery(
    <PromptCard item={feedItemSchema.parse(raw)} from="trending" position={1} onRequireAuth={onRequireAuth} onFork={vi.fn()} />
  );

beforeEach(() => {
  installIntersectionObserver();
  useAuthStore.setState({ isAuthenticated: false, accessToken: undefined });
});

describe('PromptCard', () => {
  it.each(PROMPT_FORMS)('shows the %s badge', (form) => {
    card(makeItem(1, { form }));
    expect(screen.getByText(FORM_LABELS[form])).toBeInTheDocument();
  });

  it('shows the structure strip only for structured forms', () => {
    const { unmount } = card(makeItem(1, { form: 'system_prompt' }));
    expect(screen.getByLabelText('Prompt structure')).toHaveTextContent('Rules');
    unmount();
    card(makeItem(1, { form: 'short', structure: { sections: [{ title: 'Rules' }], variables: [], steps: 0 } }));
    expect(screen.queryByLabelText('Prompt structure')).toBeNull();
  });

  it('caps section chips at 5 and shows variable and step counts', () => {
    const sections = Array.from({ length: 8 }, (_, i) => ({ title: `S${i}` }));
    card(makeItem(1, { form: 'chain', structure: { sections, variables: ['a', 'b', 'c'], steps: 6 } }));
    const strip = screen.getByLabelText('Prompt structure');
    expect(strip).toHaveTextContent('+3');
    expect(strip).toHaveTextContent('3 variables');
    expect(strip).toHaveTextContent('6 steps');
    expect(screen.queryByText('S5')).toBeNull();
  });

  it('shows SOTA and top-10 trending badges', () => {
    card(makeItem(0, { collections: ['sota'], stats: { likes: 0, saves: 0, forks: 0, copies: 0, applies: 0, views_7d: 0, trending_rank: 3 } }));
    expect(screen.getByText('SOTA')).toBeInTheDocument();
    expect(screen.getByText('#3')).toBeInTheDocument();
  });

  it('metadata-only items have no Copy and link out', () => {
    card(makeItem(1, { text_available: false }));
    expect(screen.queryByRole('button', { name: 'Copy prompt' })).toBeNull();
    expect(screen.getByRole('link', { name: /Preview on acme\/prompts/ })).toHaveAttribute('href', 'https://github.com/acme/prompts');
  });

  it('anonymous like asks for an account', () => {
    const onRequireAuth = vi.fn();
    card(makeItem(4), onRequireAuth);
    fireEvent.click(screen.getByRole('button', { name: /^Like/ }));
    expect(onRequireAuth).toHaveBeenCalledWith({ kind: 'like', slug: makeItem(4).slug });
  });

  it('without a reader (related lists) the title links to the prompt page', () => {
    card(makeItem(1));
    expect(screen.getByRole('link', { name: 'Prompt 1' })).toHaveAttribute('href', expect.stringContaining('/prompts/'));
    expect(screen.queryByRole('button', { name: 'Read' })).toBeNull();
  });

  it('with a reader the title is a toggle and Read opens it', () => {
    const onToggle = vi.fn();
    const reader = {
      open: false, active: false, onToggle, onClose: vi.fn(), onPrev: vi.fn(), onNext: vi.fn(), onSwipe: vi.fn(),
      hasPrev: false, hasNext: true, onOpenRelated: vi.fn(), settings: { keepOpen: false, softCollapse: false },
      onSetting: vi.fn(), focusMode: false, copyTick: 0,
    };
    renderWithQuery(
      <PromptCard item={feedItemSchema.parse(makeItem(1))} from="trending" position={1} onRequireAuth={vi.fn()} onFork={vi.fn()} reader={reader} />
    );
    const title = screen.getByRole('button', { name: 'Prompt 1' });
    expect(title).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(screen.getByRole('button', { name: 'Read' }));
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('uses RTL for Arabic items', () => {
    card(makeItem(1, { language: 'ar', title: 'موجه' }));
    expect(screen.getByRole('heading', { name: 'موجه' })).toHaveAttribute('dir', 'rtl');
  });
});
