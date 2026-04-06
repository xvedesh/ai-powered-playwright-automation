import path from 'path';

import { env } from '@config/env';
import { defineConfig, devices } from '@playwright/test';

const authStatePath = path.join(__dirname, 'playwright/.auth/user.json');
const playwrightJsonReportPath = path.join(__dirname, 'artifacts/playwright-report.json');
const rawWorkers = process.env.PLAYWRIGHT_WORKERS ?? (process.env.CI ? '50%' : '75%');
const configuredWorkers = /^\d+$/.test(rawWorkers) ? Number(rawWorkers) : rawWorkers;

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: configuredWorkers,
  reporter: [
    ['html', { open: 'never' }],
    ['list'],
    ['json', { outputFile: playwrightJsonReportPath }]
  ],
  outputDir: 'test-results',
  use: {
    baseURL: env.baseUrl,
    headless: env.execution.headless,
    trace: process.env.CI ? 'retain-on-failure' : 'on-first-retry',
    screenshot: 'only-on-failure',
    video: process.env.CI ? 'on-first-retry' : 'retain-on-failure',
    actionTimeout: 10000,
    navigationTimeout: 30000
  },
  projects: [
    {
      name: 'setup',
      testMatch: /setup\/.*\.setup\.ts/
    },
    {
      name: 'api',
      testMatch: /api-tests\/.*\.spec\.ts/
    },
    {
      name: 'integration-chromium',
      testMatch: /integration-tests\/.*\.spec\.ts/,
      dependencies: ['setup'],
      use: {
        ...devices['Desktop Chrome'],
        storageState: authStatePath
      }
    },
    {
      name: 'chromium',
      testMatch: /ui-tests\/.*\.spec\.ts/,
      dependencies: ['setup'],
      use: {
        ...devices['Desktop Chrome'],
        storageState: authStatePath
      }
    },
    {
      name: 'firefox',
      testMatch: /ui-tests\/.*\.spec\.ts/,
      dependencies: ['setup'],
      use: {
        ...devices['Desktop Firefox'],
        storageState: authStatePath
      }
    }
    // {
    //   name: 'webkit',
    //   testMatch: /ui-tests\/.*\.spec\.ts/,
    //   dependencies: ['setup'],
    //   use: {
    //     ...devices['Desktop Safari'],
    //     storageState: authStatePath
    //   }
    // }
    // WebKit is intentionally disabled on this macOS 12 machine because
    // Playwright's bundled WebKit support requires a newer macOS runtime here.
    // On a supported machine, uncomment this project and run:
    // npx playwright install webkit
  ]
});
