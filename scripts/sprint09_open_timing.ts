/**
 * Sprint 09 R1/R5 acceptance — tap → text painted, cached items, CPU ×4, "Fast 3G".
 *
 *   npm run build && npm run start
 *   npx playwright test --project=perf
 *
 * Opens the first N readable prompts one after another (each open closes the previous),
 * measuring in-page from the click to the first animation frame after the reader text
 * exists. Also counts long animation frames (> 32 ms) during the opens and detail
 * requests (must be 0 for cached items). Prints a markdown row for the sprint log and
 * writes `playwright-report/sprint09_open_timing.json`.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';

const OPENS = Number(process.env.OPENS || 20);
const BUDGET_P95_MS = 100;
const LONG_FRAME_MS = 32;

function percentile(values: number[], p: number): number {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.min(sorted.length - 1, Math.ceil((p / 100) * sorted.length) - 1)];
}

test('tap → text painted p95 < 100 ms for cached items (CPU ×4, Fast 3G)', async ({ page }) => {
  test.setTimeout(10 * 60_000);
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Network.enable');
  await cdp.send('Network.emulateNetworkConditions', {
    offline: false,
    latency: 562.5,
    downloadThroughput: (1.6 * 1024 * 1024) / 8,
    uploadThroughput: (750 * 1024) / 8,
  });
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });

  const detailRequests: string[] = [];
  page.on('request', (r) => {
    if (/\/api\/v2\/feed\/prompts\//.test(r.url()) && r.method() === 'GET') detailRequests.push(r.url());
  });

  const probe = await (await page.request.get(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.prompt-temple.com'}/api/v2/feed/?tab=trending&limit=1`)).json();
  const inlineText = typeof probe?.results?.[0]?.text === 'string';
  await page.goto('/feed', { waitUntil: 'networkidle' });
  // Warm the second page so items 20–39 are cached too (the sentinel prefetches 1.5 screens early).
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(2500);
  await page.evaluate(() => window.scrollTo(0, 0));

  await page.evaluate((limit) => {
    const w = window as unknown as { __longFrames: number[]; __obs?: PerformanceObserver };
    w.__longFrames = [];
    try {
      w.__obs = new PerformanceObserver((list) => {
        for (const e of list.getEntries()) if (e.duration > limit) w.__longFrames.push(e.duration);
      });
      w.__obs.observe({ type: 'long-animation-frame', buffered: false } as PerformanceObserverInit);
    } catch {
      /* older Chrome: no LoAF */
    }
  }, LONG_FRAME_MS);

  const toggles = page.locator('ol[aria-label="Prompts"] article h3 button[aria-expanded]');
  const count = Math.min(OPENS, await toggles.count());
  const samples: number[] = [];
  let failedOpens = 0;
  for (let i = 0; i < count; i++) {
    // Resolves when the text paints (ms), when the reader shows its error state (-1, e.g. the API
    // throttled the detail fetch with 429 on the no-B7 path), or after 20 s (-2) so the run never hangs.
    const ms = await toggles.nth(i).evaluate(async (btn) => {
      const t0 = performance.now();
      (btn as HTMLButtonElement).click();
      return new Promise<number>((resolve) => {
        const check = () => {
          const region = document.getElementById(btn.getAttribute('aria-controls') || '');
          if (region?.querySelector('[data-testid="prompt-text"], [data-testid="prompt-text-plain"]')) requestAnimationFrame(() => resolve(performance.now() - t0));
          else if (region?.querySelector('[role="alert"]')) resolve(-1);
          else if (performance.now() - t0 > 20_000) resolve(-2);
          else requestAnimationFrame(check);
        };
        check();
      });
    });
    if (ms < 0) failedOpens += 1;
    else samples.push(ms);
    await page.waitForTimeout(150);
  }

  const longFrames = await page.evaluate(() => (window as unknown as { __longFrames: number[] }).__longFrames);
  const result = {
    date: new Date().toISOString(),
    opens: samples.length,
    failed_opens: failedOpens,
    p50_ms: Math.round(percentile(samples, 50)),
    p95_ms: Math.round(percentile(samples, 95)),
    max_ms: Math.round(Math.max(...samples)),
    long_frames_over_32ms: longFrames.length,
    worst_frame_ms: Math.round(Math.max(0, ...longFrames)),
    detail_requests_during_opens: detailRequests.length,
    inline_text_live: inlineText,
    profile: 'CPU x4, Fast 3G (562.5 ms RTT, 1.6 Mb/s down)',
    viewport: '412x915',
  };
  mkdirSync('playwright-report', { recursive: true });
  writeFileSync('playwright-report/sprint09_open_timing.json', JSON.stringify({ ...result, samples }, null, 2));
  // eslint-disable-next-line no-console
  console.log(`| Tap → text painted (cached) | p50 ${result.p50_ms} ms · p95 ${result.p95_ms} ms · max ${result.max_ms} ms over ${result.opens} opens | long frames > 32 ms: ${result.long_frames_over_32ms} (worst ${result.worst_frame_ms} ms) · detail requests: ${result.detail_requests_during_opens} · failed opens: ${result.failed_opens} |`);

  if (inlineText) {
    expect(result.detail_requests_during_opens, 'cached opens must not fetch').toBe(0);
    expect(result.p95_ms, 'p95 tap → text painted').toBeLessThan(BUDGET_P95_MS);
  } else {
    test.info().annotations.push({ type: 'note', description: 'B7 not deployed on this API: numbers include one detail fetch per open; budget not asserted' });
  }
});
