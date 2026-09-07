import { defineConfig } from '@playwright/test'

const baseURL = `${(process.env.E2E_BASE_URL ?? 'http://127.0.0.1:5180').replace(/\/$/, '')}/`

export default defineConfig({
  testDir: './tests/e2e',
  use: { baseURL, browserName: 'chromium', channel: process.env.PLAYWRIGHT_CHANNEL, headless: true },
  webServer: process.env.CI ? {
    command: 'npm run preview -- --port 5180',
    url: baseURL,
    reuseExistingServer: false,
    timeout: 30000,
  } : undefined,
  reporter: 'list',
  outputDir: process.env.HM_TEST_OUTPUT ?? 'test-results',
  fullyParallel: false,
  workers: 1,
  timeout: 30000,
})
