import { defineConfig, devices } from '@playwright/test';

/**
 * Sprint 09 §8 flows (`e2e/`) and the R5 timing script (`scripts/sprint09_open_timing.ts`).
 *
 * Run against a production build so the numbers mean something:
 *   npm run build && npm run start            (port 3000 — the API's CORS allows only this port)
 *   npx playwright test                       # desktop + 375 px flows
 *   npx playwright test --project=perf        # tap → text timing, CPU ×4, Fast 3G
 * `reuseExistingServer` is on, so a running `next dev` on :3000 is used as-is (slower, fine for flows).
 */
export default defineConfig({
  testDir: 'e2e',
  timeout: 90_000,
  expect: { timeout: 15_000 },
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report' }]],
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } } },
    { name: 'mobile-375', use: { ...devices['Pixel 5'], viewport: { width: 375, height: 667 } } },
    { name: 'perf', testDir: 'scripts', testMatch: /sprint09_open_timing\.ts/, use: { ...devices['Desktop Chrome'], viewport: { width: 412, height: 915 } } },
  ],
  webServer: {
    command: 'npm run start',
    url: 'http://localhost:3000/feed',
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
