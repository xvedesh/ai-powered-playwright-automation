import type { Locator, Page, Route } from '@playwright/test';

const BLOCKED_AD_HOST_PATTERNS = [
  'googleads',
  'doubleclick',
  'google-analytics',
  'facebook.net'
];

function shouldBlockRequest(route: Route): boolean {
  const url = route.request().url().toLowerCase();
  return BLOCKED_AD_HOST_PATTERNS.some((pattern) => url.includes(pattern));
}

async function registerDismissHandler(locator: Locator): Promise<void> {
  await locator.page().addLocatorHandler(locator, async (overlay) => {
    try {
      if (await overlay.isVisible().catch(() => false)) {
        await overlay.click({ force: true, timeout: 2_000 });
      }
    } catch {
      // The handler must stay best-effort to avoid masking the real test failure.
    }
  });
}

export async function installAdGuards(page: Page): Promise<void> {
  await page.route('**/*', async (route) => {
    if (shouldBlockRequest(route)) {
      await route.abort();
      return;
    }
    await route.continue();
  });

  const dismissTargets = [
    page.getByRole('button', { name: /^(close|dismiss)$/i }),
    page.getByRole('button', { name: /^(x|×)$/i }),
    page.getByRole('link', { name: /^(close|dismiss)$/i }),
    page.getByText(/^(close|dismiss)$/i).first(),
    page.getByText(/^(x|×)$/i).first()
  ];

  for (const locator of dismissTargets) {
    await registerDismissHandler(locator);
  }
}
