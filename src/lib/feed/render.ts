/**
 * Variable substitution for "Copy filled prompt" (F3).
 *
 * Dependency-free on purpose: the Chrome extension will consume this module later
 * (sprint doc §6). Same rules as the backend `render_filled`
 * (`apps/feed/services/prompt_views.py`), whose test cases live in `render.test.ts`:
 *
 *  1. Four placeholder syntaxes, exact variable name:
 *     `{{name}}` (inner whitespace allowed), `{name}` (not part of `{{…}}`),
 *     `[NAME]` (not a markdown link `[NAME](…)`), `<NAME>`.
 *  2. Only the given variables are substituted; any other token is left as-is.
 *  3. A variable without a value (undefined / empty) is left untouched and reported in
 *     `missing`.
 *  4. Values are inserted literally (`$1`, `\1`, `{{other}}` are not expanded).
 *
 * One pass over the text, so a value that contains another placeholder is never
 * substituted again (the backend loops per variable; the result is the same unless a
 * value contains a placeholder).
 *
 * Names come from the backend (`structure.variables` / `views.variables`), never
 * re-detected here.
 */

export type VariableValues = Record<string, string | number | boolean | null | undefined>;

export interface RenderResult {
  /** The prompt with every given, non-empty variable substituted. */
  text: string;
  /** Variables that had no value, in `variables` order. */
  missing: string[];
  /** Variables that were substituted at least once, in `variables` order. */
  filled: string[];
  /** Number of replacements performed. */
  replacements: number;
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function valueToString(v: VariableValues[string]): string | null {
  if (v === null || v === undefined) return null;
  const s = typeof v === 'string' ? v : String(v);
  return s.length ? s : null;
}

/**
 * Substitute `values` for the placeholders of `variables` in `template`.
 *
 * @param template  prompt text
 * @param variables variable names from the backend
 * @param values    user-entered values keyed by variable name
 */
export function renderFilled(template: string, variables: readonly string[], values: VariableValues): RenderResult {
  const names = Array.from(new Set(variables.filter(Boolean)));
  const resolved = new Map<string, string>();
  for (const name of names) {
    const v = valueToString(values?.[name]);
    if (v !== null) resolved.set(name, v);
  }
  const missing = names.filter((n) => !resolved.has(n));
  const text = template ?? '';
  if (!resolved.size) return { text, missing, filled: [], replacements: 0 };

  // Longest names first so `topic_area` wins over `topic` in the same alternation.
  const alternation = Array.from(resolved.keys())
    .sort((a, b) => b.length - a.length)
    .map(escapeRegExp)
    .join('|');
  // Groups: 1 = {{ name }}, 2 = {name}, 3 = [name], 4 = <name>.
  const pattern = new RegExp(
    `\\{\\{\\s*(${alternation})\\s*\\}\\}|\\{(${alternation})\\}|\\[(${alternation})\\](?!\\()|<(${alternation})>`,
    'g'
  );

  const filled = new Set<string>();
  let replacements = 0;
  const out = text.replace(pattern, (whole: string, dbl?: string, single?: string, square?: string, angle?: string, offset?: number) => {
    const name = dbl ?? single ?? square ?? angle;
    if (single !== undefined) {
      // `{name}` must not touch a brace on either side (backend: (?<!\{)…(?!\})).
      const at = offset ?? 0;
      if (text[at - 1] === '{' || text[at + whole.length] === '}') return whole;
    }
    const value = name !== undefined ? resolved.get(name) : undefined;
    if (value === undefined) return whole;
    filled.add(name!);
    replacements += 1;
    return value;
  });

  return { text: out, missing, filled: names.filter((n) => filled.has(n)), replacements };
}
