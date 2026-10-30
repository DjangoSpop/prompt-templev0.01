import { describe, expect, it } from 'vitest';
import { renderFilled } from '../render';

const fill = (text: string, values: Record<string, string>) => renderFilled(text, Object.keys(values), values).text;

describe('renderFilled — shared cases (backend apps/feed/tests/test_prompt_views.py RenderFilledTests)', () => {
  it('substitutes all four syntaxes', () => {
    expect(fill('Hi {{name}}, {topic} for [AUDIENCE] in <LANG>.', { name: 'Ana', topic: 'SEO', AUDIENCE: 'devs', LANG: 'en' })).toBe(
      'Hi Ana, SEO for devs in en.'
    );
  });

  it('leaves unknown and empty variables untouched', () => {
    const r = renderFilled('Hi {{name}}, about {topic}.', ['name', 'topic'], { name: 'Ana', topic: '', other: 'x' });
    expect(r.text).toBe('Hi Ana, about {topic}.');
    expect(r.missing).toEqual(['topic']);
    expect(r.filled).toEqual(['name']);
  });

  it('inserts values literally', () => {
    expect(fill('{{a}}', { a: '\\1 $0 $& {{b}}' })).toBe('\\1 $0 $& {{b}}');
  });

  it('does not substitute markdown link text', () => {
    expect(fill('[TOPIC](https://x) and [TOPIC]', { TOPIC: 'AI' })).toBe('[TOPIC](https://x) and AI');
  });
});

describe('renderFilled — edges', () => {
  it('allows whitespace inside double braces only', () => {
    expect(fill('Use {{ product }} and { product }.', { product: 'X' })).toBe('Use X and { product }.');
  });

  it('treats {name} next to another brace like the backend', () => {
    expect(fill('{{{a}}}', { a: 'v' })).toBe('{v}');
    expect(fill('{a}{a}', { a: 'v' })).toBe('vv');
  });

  it('matches names exactly (case-sensitive)', () => {
    expect(fill('[TOPIC] and [topic]', { TOPIC: 'AI' })).toBe('AI and [topic]');
  });

  it('prefers the longest name', () => {
    expect(fill('{{topic_area}} / {{topic}}', { topic: 'A', topic_area: 'B' })).toBe('B / A');
  });

  it('does not re-substitute inside inserted values', () => {
    expect(fill('{{a}} {{b}}', { a: '{{b}}', b: 'B' })).toBe('{{b}} B');
  });

  it('counts replacements and reports nothing filled for no values', () => {
    expect(renderFilled('{{a}} {{a}}', ['a'], { a: 'x' }).replacements).toBe(2);
    expect(renderFilled('{{a}}', ['a'], {})).toEqual({ text: '{{a}}', missing: ['a'], filled: [], replacements: 0 });
  });

  it('escapes regex characters in names', () => {
    expect(fill('{{first.name}} {{firstXname}}', { 'first.name': 'Ana' })).toBe('Ana {{firstXname}}');
  });
});
