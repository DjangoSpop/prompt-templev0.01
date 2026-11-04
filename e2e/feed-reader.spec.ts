/**
 * Sprint 09 §8 — end-to-end reader flows, desktop and 375 px (projects in playwright.config.ts).
 * Needs the backend feed (FEED_ENABLED) reachable from the app under test.
 */
import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { renderFilled } from '../src/lib/feed/render';

const API = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.prompt-temple.com';

/** B7 deployed? Items then carry `text` inline and cached opens must not fetch. */
async function inlineTextLive(page: Page): Promise<boolean> {
  const res = await (await page.request.get(`${API}/api/v2/feed/?tab=trending&limit=1`)).json();
  return typeof res?.results?.[0]?.text === 'string';
}

/**
 * Pre-existing app-shell issue (not Sprint 09): below `md` the sidebar `<aside class="fixed …">` stays
 * translated in and covers the column, so taps never reach the cards. Hidden here so the flows test
 * the reader; logged for Basha in docs/sprint09/sprint_log.md.
 */
async function hideMobileSidebar(page: Page) {
  const w = page.viewportSize()?.width ?? 1280;
  if (w >= 768) return;
  // What a visitor does: tap the backdrop to dismiss the drawer. Fall back to hiding it.
  // dispatchEvent: the drawer's <aside> sits above the backdrop, so a real pointer click never lands.
  const backdrop = page.locator('div.fixed.inset-0.z-40');
  if (await backdrop.isVisible().catch(() => false)) await backdrop.dispatchEvent('click', {}, { timeout: 2000 }).catch(() => {});
  await page.addStyleTag({ content: 'aside.fixed, div.fixed.inset-0.z-40 { display: none !important; }' });
}

const readableTitles = (page: Page) => page.locator('ol[aria-label="Prompts"] article h3 button[aria-expanded]');
const region = (page: Page) => page.getByTestId('reader-region');
const promptCalls = (page: Page) => {
  const calls: string[] = [];
  page.on('request', (r) => {
    if (/\/api\/v2\/feed\/prompts\//.test(r.url()) && r.method() === 'GET') calls.push(r.url());
  });
  return calls;
};

async function swipeLeft(page: Page) {
  const box = await region(page).boundingBox();
  if (!box) throw new Error('reader not visible');
  const y = box.y + Math.min(120, box.height / 2);
  const common = { pointerType: 'touch', pointerId: 7, isPrimary: true, bubbles: true };
  await region(page).dispatchEvent('pointerdown', { ...common, clientX: box.x + box.width - 20, clientY: y });
  await region(page).dispatchEvent('pointerup', { ...common, clientX: box.x + 20, clientY: y });
}

async function next(page: Page, mobile: boolean) {
  if (mobile) await swipeLeft(page);
  else await page.keyboard.press('j');
  // the previous reader stays mounted for its 160 ms exit animation
  await expect(page.getByTestId('reader-region')).toHaveCount(1);
}

test.describe('flow 1 — read ten in a row', () => {
  test('taps and j/swipe move through ten prompts with zero navigations and zero spinners', async ({ page }, info) => {
    const mobile = info.project.name === 'mobile-375';
    const calls = promptCalls(page);
    // `?p=` sync uses pushState/replaceState (same-document); a real navigation requests a new document.
    let navigations = 0;
    page.on('request', (r) => r.resourceType() === 'document' && r.isNavigationRequest() && navigations++);
    await page.goto('/feed');
    await hideMobileSidebar(page);
    navigations = 0;
    await readableTitles(page).first().click();
    await expect(region(page)).toBeVisible();
    for (let i = 0; i < 9; i++) {
      await next(page, mobile);
      await expect(region(page)).toBeVisible();
      await expect(page.getByTestId('prompt-text')).toBeVisible();
    }
    await expect(page.getByTestId('reader-region')).toHaveCount(1);
    const tenth = await region(page).getAttribute('aria-labelledby');
    const title = await page.locator(`[id="${tenth}"]`).innerText();
    expect(new URL(page.url()).searchParams.get('p')).toBeTruthy();
    expect(navigations).toBe(0);
    if (await inlineTextLive(page)) expect(calls, 'cached items open without a detail request').toHaveLength(0);
    else test.info().annotations.push({ type: 'note', description: `B7 not deployed: ${calls.length} detail fetches on open (degrade path)` });
    await expect(page.locator('[aria-busy="true"][aria-label="Loading prompt"]')).toHaveCount(0);
    const scrolled = await page.evaluate(() => window.scrollY);
    await page.goBack();
    await expect(region(page)).toHaveCount(0);
    expect(new URL(page.url()).pathname).toBe('/feed');
    expect(await page.evaluate(() => window.scrollY)).toBeGreaterThanOrEqual(Math.min(scrolled, 1));
    expect(title.length).toBeGreaterThan(0);
  });
});

test.describe('flow 2 — copy from the coloured view', () => {
  test.skip(({ browserName }) => browserName !== 'chromium', 'clipboard permissions are Chromium-only');
  test('copy equals text; Variables → Copy filled equals render_filled', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.goto('/feed?form=template_vars');
    await hideMobileSidebar(page);
    const first = readableTitles(page).first();
    await first.click();
    await expect(region(page)).toBeVisible();
    const slug = new URL(page.url()).searchParams.get('p')!;
    const detail = await (await page.request.get(`${API}/api/v2/feed/prompts/${slug}/`)).json();
    await page.getByTestId('reader-copy').click();
    await expect(page.getByTestId('reader-copy')).toContainText('Copied');
    // writeText receives `text` byte for byte (unit-tested); the OS clipboard may normalise CRLF on read-back.
    const lf = (s: string) => s.replace(/\r\n/g, '\n');
    expect(lf(await page.evaluate(() => navigator.clipboard.readText()))).toBe(lf(detail.text));

    const variablesTab = page.getByRole('tab', { name: 'Variables' });
    test.skip(!(await variablesTab.count()), 'views disabled on this backend (PROMPT_VIEWS_ENABLED=false)');
    await variablesTab.click();
    const inputs = page.getByTestId('reader-variables').getByRole('textbox');
    await inputs.nth(0).fill('Ada');
    await inputs.nth(1).fill('tests');
    await expect(page.getByTestId('reader-copy')).toContainText('Copy filled');
    await page.getByTestId('reader-copy').click();
    const names: string[] = detail.views.variables.map((v: { name: string }) => v.name);
    const expected = renderFilled(detail.text, names, { [names[0]]: 'Ada', [names[1]]: 'tests' }).text;
    expect(lf(await page.evaluate(() => navigator.clipboard.readText()))).toBe(lf(expected));
  });
});

test.describe('flow 3 — deep link', () => {
  test('a page-3 slug opens pinned within one fetch, noindex, "View as page" → SEO URL', async ({ page }) => {
    let cursor: string | null = null;
    let slug = '';
    for (let p = 0; p < 3; p++) {
      const res = await (await page.request.get(`${API}/api/v2/feed/?tab=trending&limit=20${cursor ? `&cursor=${cursor}` : ''}`)).json();
      slug = res.results.find((r: { text_available?: boolean }) => r.text_available !== false)?.slug ?? slug;
      cursor = res.next_cursor;
      if (!cursor) break;
    }
    const calls = promptCalls(page);
    await page.goto(`/feed?p=${encodeURIComponent(slug)}`);
    await hideMobileSidebar(page);
    await expect(region(page)).toBeVisible();
    expect(calls.length).toBeLessThanOrEqual(1);
    await expect(page.locator('ol[aria-label="Prompts"] li').first()).toHaveAttribute('data-pinned', 'true');
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
    const view = page.getByTestId('reader-footer').getByRole('link', { name: 'View as page' });
    await expect(view).toHaveAttribute('href', new RegExp(`^/prompts/${slug.split('/')[0]}/`));
  });
});

test.describe('flow 4 — reduced motion, keyboard only, axe', () => {
  test('ten prompts by keyboard under prefers-reduced-motion with no serious axe violations', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/feed');
    await hideMobileSidebar(page);
    await readableTitles(page).first().focus();
    await page.keyboard.press('Enter');
    await expect(region(page)).toBeVisible();
    await expect(region(page)).toBeFocused();
    for (let i = 0; i < 9; i++) {
      await page.keyboard.press('j');
      await expect(page.getByTestId('reader-region')).toHaveCount(1);
      await expect(page.getByTestId('prompt-text')).toBeVisible();
    }
    const results = await new AxeBuilder({ page }).include('ol[aria-label="Prompts"]').analyze();
    const serious = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
    expect(serious, JSON.stringify(serious.map((v) => ({ id: v.id, nodes: v.nodes.length })), null, 2)).toEqual([]);
    await page.keyboard.press('c');
    await page.keyboard.press('Escape');
    await expect(region(page)).toHaveCount(0);
    await expect(readableTitles(page).nth(9)).toBeFocused();
  });
});
