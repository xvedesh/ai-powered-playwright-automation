import path from 'path';

export const frameworkPaths = {
  authStorageState: path.join(process.cwd(), 'playwright/.auth/user.json')
} as const;
