import path from 'path';

import { env } from '@config/env';
import { defineConfig, devices } from '@playwright/test';

const authStatePath = path.join(__dirname, 'playwright/.auth/user.json');

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [
    ['html'],
    ['list']
  ],
  outputDir: 'test-results',
  use: {
    baseURL: env.baseUrl,
    headless: env.execution.headless,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
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
