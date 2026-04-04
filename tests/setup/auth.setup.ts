import { test as setup } from '@playwright/test';

import { UserCredentialsBuilder } from '@builders/UserCredentialsBuilder';
import { env } from '@config/env';
import { frameworkPaths } from '@config/paths';
import { AuthSession } from '@core/auth/AuthSession';

setup('establish reusable storage state', async ({ page }) => {
  const credentials =
    env.auth.email && env.auth.password
      ? UserCredentialsBuilder.create()
          .withEmail(env.auth.email)
          .withPassword(env.auth.password)
          .build()
      : undefined;

  const authSession = new AuthSession(page);
  await authSession.establishStorageState(credentials);
  await page.context().storageState({ path: frameworkPaths.authStorageState });
});
