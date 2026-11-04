/** R3.2 — PromptText renders the tokenizer output with data-kind, chips and a plain fallback. */
import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/feed/tokenize', async (orig) => {
  const real = await orig<typeof import('@/lib/feed/tokenize')>();
  return { ...real, tokenize: vi.fn(real.tokenize) };
});

import { tokenize } from '@/lib/feed/tokenize';
import { groupBlocks, PromptText, variableName } from '../PromptText';

const TEXT = [
  'You are a senior reviewer.',
  '',
  '## Rules',
  '- You must never approve code without tests.',
  '- Keep it short',
  '',
  'Write for {{name}} about {topic} for [AUDIENCE] in <LANG>. Return only JSON.',
  '```json',
  '{"a": 1}',
  '```',
].join('\n');

afterEach(() => vi.mocked(tokenize).mockReset());

describe('PromptText', () => {
  it('renders kinds as data-kind elements with heading ids', () => {
    render(<PromptText text={TEXT} idPrefix="r1" immediate />);
    const root = screen.getByTestId('prompt-text');
    expect(root.querySelector('[data-kind="role"]')).toHaveTextContent('You are a senior reviewer.');
    const heading = root.querySelector('h4[data-kind="heading"]');
    expect(heading).toHaveAttribute('id', 'r1-h-0');
    expect(heading).toHaveAttribute('title', 'Rules');
    expect(root.querySelector('li[data-kind="rule"]')).toHaveTextContent('must never');
    expect(root.querySelector('li[data-kind="list"]')).toHaveTextContent('Keep it short');
    expect(root.querySelector('[data-kind="format"]')).toHaveTextContent('Return only JSON');
    expect(root.querySelector('pre[data-kind="code"]')).toHaveTextContent('{"a": 1}');
    expect(root.querySelector('pre[data-kind="code"] mark')).toBeNull();
  });

  it('variables become chips that keep their characters and open the Variables view', () => {
    const onVariable = vi.fn();
    render(<PromptText text={TEXT} idPrefix="r2" immediate onVariable={onVariable} />);
    const chips = screen.getByTestId('prompt-text').querySelectorAll('mark[data-kind="variable"]');
    expect(Array.from(chips).map((c) => c.textContent)).toEqual(['{{name}}', '{topic}', '[AUDIENCE]', '<LANG>']);
    fireEvent.click(chips[0]);
    expect(onVariable).toHaveBeenCalledWith('name');
    expect(screen.getByTestId('prompt-text').textContent).toContain('Write for {{name}} about {topic} for [AUDIENCE] in <LANG>.');
  });

  it('variableName strips the four syntaxes', () => {
    expect(variableName('{{ name }}')).toBe('name');
    expect(variableName('{topic}')).toBe('topic');
    expect(variableName('[AUDIENCE]')).toBe('AUDIENCE');
    expect(variableName('<LANG>')).toBe('LANG');
  });

  it('plain mode keeps the markup but marks the container', () => {
    render(<PromptText text={TEXT} idPrefix="r3" immediate mode="plain" />);
    expect(screen.getByTestId('prompt-text')).toHaveAttribute('data-mode', 'plain');
  });

  it('mounts the tail on the next frame for long texts', async () => {
    const long = Array.from({ length: 40 }, (_, i) => `Paragraph ${i} with enough words to pass the first paint budget quickly.`).join('\n\n');
    render(<PromptText text={long} idPrefix="r4" />);
    const root = screen.getByTestId('prompt-text');
    expect(root).toHaveAttribute('data-tail', 'pending');
    await act(async () => {
      await new Promise((r) => requestAnimationFrame(() => r(null)));
    });
    expect(root).toHaveAttribute('data-tail', 'mounted');
    expect(root.textContent).toContain('Paragraph 39');
  });

  it('falls back to plain text when the tokenizer throws', () => {
    vi.mocked(tokenize).mockImplementation(() => {
      throw new Error('boom');
    });
    const onFallback = vi.fn();
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(<PromptText text={TEXT} idPrefix="r5" immediate onFallback={onFallback} />);
    expect(screen.getByTestId('prompt-text-plain')).toHaveTextContent('You are a senior reviewer.');
    expect(onFallback).toHaveBeenCalled();
    spy.mockRestore();
  });

  it('groupBlocks merges list runs and code runs', () => {
    const lines = tokenize('- a\n- b\ntext\n```\nx\ny\n```');
    const blocks = groupBlocks(lines);
    expect(blocks.map((b) => b.type)).toEqual(['list', 'line', 'code']);
    expect((blocks[0] as { lines: unknown[] }).lines).toHaveLength(2);
    expect((blocks[2] as { lines: unknown[] }).lines).toHaveLength(4);
  });
});
